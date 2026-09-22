import React, { useEffect, useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import {
  Box,
  MenuItem,
  FormControl,
  Button,
  TextField,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Select,
  InputLabel,
} from "@mui/material";
import {
  getContractDetails,
  getArenda,
  createArenda,
  createPlataArenda,
  getPlatiArenda,
  generareAn,
  getConfigAnList,
} from "../services/api";
import { ContractDetails, Arenda, ConfigAn } from "../types/index";
import QRCodeSVG from "react-qr-code";

export const ArendaPage = () => {
  const { id_contract } = useParams();

  const [contract, setContract] = useState<ContractDetails | null>(null);
  const ani = useMemo(
    () => generareAn(contract?.data_contract),
    [contract?.data_contract],
  );
  const [arenda, setArenda] = useState<Arenda | null>(null);
  const [anSelectat, setAnSelectat] = React.useState<string>("2025");
  const [nivel_lei, setNivel_lei] = useState<number | string>("750");
  const [tipPlata, setTipPlata] = useState("porumb");
  const [configuriAn, setConfiguriAn] = useState<ConfigAn[]>([]);
  const [cantitate, setCantitate] = useState<number | string>("");

  const [metodaPlata, setMetodaPlata] = useState("ridicare");

  // Helper: -5 zile lucratoare (skip weekends)
  const getDateMinus5WorkingDays = (): string => {
    const data = new Date();

    // Dacă azi e weekend, ancorăm la următoarea zi lucrătoare
    // ca să evităm rezultatul cu o zi mai devreme în unele scenarii.
    const currentDay = data.getDay();
    if (currentDay === 6) {
      data.setDate(data.getDate() + 2); // Saturday -> Monday
    } else if (currentDay === 0) {
      data.setDate(data.getDate() + 1); // Sunday -> Monday
    }

    let daysToSubtract = 4; // 4 zile lucrătoare + 1 zi pentru a ajunge la data corectă

    while (daysToSubtract > 0) {
      data.setDate(data.getDate() - 1);
      const dayOfWeek = data.getDay();
      // 0 = Sunday, 6 = Saturday
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        daysToSubtract--;
      }
    }

    const day = String(data.getDate()).padStart(2, "0");
    const month = String(data.getMonth() + 1).padStart(2, "0");
    const year = data.getFullYear();
    return `${day}-${month}-${year}`; // format: DD-MM-YYYY
  };

  const [observatii, setObservatii] = useState("");
  const [dataEmitereOblio, setDataEmitereOblio] = useState<string>(
    getDateMinus5WorkingDays(),
  );
  const [qrData, setQrData] = useState<any>(null); // Tipizare pentru răspuns backend
  const [platiExistente, setPlatiExistente] = useState<any[]>([]);

  const [loading, setLoading] = useState(false);
  const [loadingPlati, setLoadingPlati] = useState(false);

  const suprafataTotala =
    contract?.terenuri.reduce(
      (total, teren) => total + parseFloat(teren.suprafata || "0"),
      0,
    ) || 0;
  const nivelArenda = Number(contract?.nivel_arenda || 1);
  //const nivelArenda = 1000;

  // Config de preț pentru anul selectat + prețul culturii alese (lei/kg).
  const configAnCurent = configuriAn.find((c) => c.an === anSelectat) || null;
  const pretKgCultura: number | null =
    tipPlata === "grau"
      ? (configAnCurent?.pret_kg_grau ?? null)
      : tipPlata === "porumb"
        ? (configAnCurent?.pret_kg_porumb ?? null)
        : null;
  // Cultură fără preț configurat pe anul ăsta (doar la arende noi) → avertisment.
  const pretCulturaLipsa =
    !arenda?.id_arenda &&
    (tipPlata === "grau" || tipPlata === "porumb") &&
    pretKgCultura == null;
  const cantitateImplicita = parseFloat(
    (suprafataTotala * nivelArenda).toFixed(2),
  );
  const arendaTotala =
    suprafataTotala * parseFloat(nivel_lei.toString() || "0");

  // Calculează suma plăților existente (exclude anulate)
  const totalPlatit = platiExistente
    .filter((p) => p.status !== "anulata")
    .reduce((sum, p) => sum + parseFloat(p.valoare_lei || 0), 0);

  const soldRamas = arendaTotala - totalPlatit;
  const valoarePlataNoua =
    tipPlata === "lei"
      ? parseFloat(cantitate?.toString() || "0")
      : parseFloat(cantitate?.toString() || "0") * //cantitate_kg × (nivel_lei / nivel_arenda)
        (parseFloat(nivel_lei.toString() || "0") / nivelArenda); // conversie în lei dacă plata e în produse

  // Helper: Convertit dată YYYY-MM-DD la DD-MM-YYYY
  const formatDataDDMMYYYY = (dateStr: string | null | undefined): string => {
    if (!dateStr) return "-";
    try {
      // Extrage doar data (ignore time)
      const datePart = dateStr.split("T")[0] || dateStr;
      const [year, month, day] = datePart.split("-");
      return `${day}-${month}-${year}`;
    } catch {
      return dateStr;
    }
  };

  useEffect(() => {
    const loadContract = async () => {
      const data = await getContractDetails(Number(id_contract));
      setContract(data);
      // setBreadcrumbLabel(`Arendă ${data.nr_contract}`);
    };
    loadContract();
  }, [id_contract]);

  useEffect(() => {
    if (contract) {
      setCantitate(cantitateImplicita);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contract]);

  // Încarcă plățile existente când se schimbă anul
  useEffect(() => {
    const loadPlati = async () => {
      if (!id_contract || !anSelectat) return;

      setLoadingPlati(true);
      try {
        // Încearcă să găsească arenda pentru acest an
        const arenda = await getArenda(Number(id_contract), anSelectat);

        console.log("getArenda response:", arenda);
        const arendaObj = Array.isArray(arenda) ? arenda[0] : arenda;
        console.log("arendaObj:", arendaObj);

        if (arendaObj?.id_arenda) {
          setArenda(arendaObj);
          // Precompletează nivel_lei din arenda existentă
          //setNivel_lei(arendaObj.nivel_lei || "750");
          setNivel_lei(arendaObj.nivel_lei)
          // Dacă există, încarcă plățile asociate
          const plati = await getPlatiArenda(arendaObj.id_arenda);
          console.log("getPlatiArenda response:", plati);
          setPlatiExistente(plati || []);
        } else {
          console.log(
            "No arenda found for contract",
            id_contract,
            "year",
            anSelectat,
          );
          setArenda(null);
          // setNivel_lei(""); // Resetează pentru an nou
          setPlatiExistente([]);
        }
      } catch (err) {
        console.error("Eroare la încărcarea plăților:", err);
        setArenda(null);
        // setNivel_lei("");
        setPlatiExistente([]);
      } finally {
        setLoadingPlati(false);
      }
    };

    loadPlati();
  }, [id_contract, anSelectat]);

  // Încarcă configurările de preț pe an (o singură dată)
  useEffect(() => {
    getConfigAnList()
      .then((res) => setConfiguriAn(res.results || []))
      .catch(() => setConfiguriAn([]));
  }, []);

  // Populează nivel_lei/ha din configul anului, după cultura selectată:
  //   nivel lei/ha = preț_kg (lei/kg) × nivel_arenda (kg/ha din contract).
  // - arendă deja salvată → păstrează nivelul ei (nu suprascrie);
  // - plată în "lei" → nu ating câmpul (se completează manual);
  // - an/cultură FĂRĂ preț configurat → golesc câmpul, ca să nu rămână o
  //   valoare veche, înșelătoare, de la alt an.
  useEffect(() => {
    if (arenda?.id_arenda) return;
    if (tipPlata !== "grau" && tipPlata !== "porumb") return;
    setNivel_lei(pretKgCultura != null ? pretKgCultura * nivelArenda : "");
  }, [tipPlata, arenda, nivelArenda, pretKgCultura]);

  const handleAnChange = (newAn: string) => {
    setAnSelectat(newAn);
    // setNivel_lei(""); // resetează nivel pentru noul an
    setPlatiExistente([]); // resetează și plăți
    setQrData(null); // resetează chitanța generată
    setCantitate(cantitateImplicita);
    setTipPlata("porumb"); //trebuie schimbat la "" acum e provizoriu porumb
    setMetodaPlata("ridicare"); // trebuie schimbat la "" acum e provizoriu ridicare
    setDataEmitereOblio(getDateMinus5WorkingDays());
    setObservatii("");
  };

  const handleGenerareChitanta = async () => {
    setLoading(true);

    // ====== VALIDĂRI ======
    // 1. Validează An Arendă
    if (!anSelectat) {
      alert("Selectează anul arendă!");
      setLoading(false);
      return;
    }

    // // 2. Validează Nivel Arendă (lei/ha)
    if (!nivel_lei || parseFloat(nivel_lei.toString()) <= 0) {
      alert("Introdu nivelul arendă în lei/hectar!");
      setLoading(false);
      return;
    }

    // // 3. Validează Tip Plată
    if (!tipPlata) {
      alert("Selectează tipul plății!");
      setLoading(false);
      return;
    }

    // // 4. Validează Cantitate
    if (!cantitate || isNaN(Number(cantitate)) || Number(cantitate) <= 0) {
      alert("Introdu o cantitate validă!");
      setLoading(false);
      return;
    }

    // 5. Validează că nu depășim soldul rămas
    if (valoarePlataNoua > soldRamas + 0.01) {
      // +0.01 pentru erori de rotunjire
      alert(
        `DEPĂȘIRE SOLD!\n\n` +
          `Sold rămas: ${soldRamas.toFixed(2)} lei\n` +
          `Încerci să plătești: ${valoarePlataNoua.toFixed(2)} lei\n\n` +
          `Reduce cantitatea!`,
      );
      setLoading(false);
      return;
    }

    // ====== TRY/CATCH ======
    try {
      // Pas 1: Creează sau găsește arenda
      const arenda = await createArenda({
        id_contract: Number(id_contract),
        an_arenda: anSelectat,
        nivel_lei: parseFloat(nivel_lei.toString()),
      });

      if (!arenda || !arenda.id_arenda) {
        alert("Eroare: Arenda nu a fost creată corect");
        setLoading(false);
        return;
      }

      // Helper: convertit DD-MM-YYYY la YYYY-MM-DD pentru backend
      const formatDataPentruBackend = (dataDDMMYYYY: string): string => {
        const [day, month, year] = dataDDMMYYYY.split("-");
        return `${year}-${month}-${day}`;
      };

      // Pas 2: Creează plata
      const plataResponse = await createPlataArenda({
        id_arenda: arenda.id_arenda,
        tip_plata: tipPlata,
        cantitate: parseFloat(cantitate.toString()),
        created_at: formatDataPentruBackend(dataEmitereOblio),
        metoda_plata: metodaPlata || null,
        observatii: observatii,
      });

      if (!plataResponse || !plataResponse.uuid) {
        alert("Eroare: Plata nu a fost creată corect");
        setLoading(false);
        return;
      }

      // Pas 3: Setează QR data
      setQrData(plataResponse);

      // Pas 4: Resetează DOAR câmpurile variabile
      setCantitate(cantitateImplicita); // resetează la cantitatea calculată
      setTipPlata("porumb"); // resetează la porumb (sau "")
      setMetodaPlata("ridicare"); // resetează la ridicare (sau "")
      setObservatii("");
      setDataEmitereOblio(getDateMinus5WorkingDays());

      // Pas 5: Reîncarcă plățile
      if (arenda?.id_arenda) {
        const platiActualizate = await getPlatiArenda(arenda.id_arenda);
        setPlatiExistente(platiActualizate || []);
      }

      // Pas 6: Mesaj succes
      alert("Chitanță generată cu succes!");
    } catch (err) {
      console.error("Eroare la generarea chitanței:", err);
      // Extrage mesajul de eroare din răspunsul Axios
      let errorMsg = "Eroare necunoscută";
      if (err && typeof err === "object" && "response" in err) {
        const axiosErr = err as any;
        errorMsg =
          axiosErr.response?.data?.error || axiosErr.message || String(err);
      }
      alert("Eroare: " + errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: { xs: 1, sm: 2 } }}>
      <Paper sx={{ p: { xs: 1.5, sm: 2 }, mt: 2, mb: 2 }}>
        <Typography>
          Arenda Contract Nr:{contract?.nr_contract}/ {contract?.data_contract}
        </Typography>
        <FormControl>
          <Typography>An Arenda</Typography>
          <Select
            value={anSelectat}
            onChange={(e) => handleAnChange(e.target.value)}
          >
            {ani.map((an) => (
              <MenuItem key={an} value={an}>
                {an}{" "}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Istoric plăți - afișat pentru orice an selectat */}
        {contract && (
          <Box sx={{ mt: 3 }}>
            <Typography>Suprafața totală : {suprafataTotala} ha</Typography>
            {/* <Typography>
              Arenda totală Lei pentru anul {anSelectat}: {arendaTotala} lei  (Nivel: {nivel_lei} lei/ha)
            </Typography> */}
            <Typography>
              Arenda totală în produse {tipPlata} pentru anul {anSelectat}:{" "}
              {/* {suprafataTotala * parseFloat(contract?.nivel_arenda || "0")} kg (Nivel Contract: {contract?.nivel_arenda} kg/ha) */}
              {/* nivel arenda aici este hardcodat la 1000 kg/ha pentru test, deci arenda totală în produse este */}
              {(suprafataTotala * nivelArenda).toFixed(2)} kg (Nivel Contract:{" "}
              {nivelArenda} kg/ha)
            </Typography>
            <Typography> Status {arenda?.status}</Typography>

            <Typography sx={{ mt: 2, fontWeight: "bold" }}>
              Istoric plăți pentru anul {anSelectat}
            </Typography>

            {loadingPlati ? (
              <CircularProgress size={20} />
            ) : platiExistente.length === 0 ? (
              <Typography color="text.secondary">
                Nu există plăți pentru acest an.
              </Typography>
            ) : (
              <TableContainer component={Paper} sx={{ mt: 1 }}>
                <Table
                  size="small"
                  sx={{ "& .MuiTableCell-root": { px: { xs: 1, sm: 2 }, whiteSpace: "nowrap" } }}
                >
                  <TableHead>
                    <TableRow>
                      <TableCell>ID</TableCell>
                      <TableCell>Tip</TableCell>
                      <TableCell>Cantitate</TableCell>
                      <TableCell>Valoare (lei)</TableCell>
                      <TableCell>Chitanta</TableCell>
                      {/* <TableCell>Plata</TableCell> */}
                      <TableCell>Data Chitanta</TableCell>
                      <TableCell>Data Emitere Oblio</TableCell>
                      <TableCell>Acțiuni</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {platiExistente.map((p: any, idx: number) => (
                      <TableRow key={p.id_plata || idx}>
                        <TableCell>{p.id_plata}</TableCell>
                        <TableCell>{p.tip_plata}</TableCell>
                        <TableCell>
                          {parseFloat(p.cantitate).toFixed(2)}
                        </TableCell>
                        <TableCell>
                          {parseFloat(p.valoare_lei).toFixed(2)}
                        </TableCell>
                        <TableCell>{p.status} </TableCell>
                        {/* <TableCell>  {arenda?.status}</TableCell> */}
                        <TableCell>
                          {formatDataDDMMYYYY(p.data_generarii)}
                        </TableCell>
                        <TableCell>
                          {formatDataDDMMYYYY(p.created_at)}
                        </TableCell>
                        <TableCell>
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() =>
                              window.open(`/chitanta/${p.uuid}`, "_blank")
                            }
                          >
                            Detalii
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <Typography
                  sx={{ fontWeight: "bold", textAlign: "left", marginTop: 1 }}
                >
                  Total plătit: {totalPlatit.toFixed(2)} lei
                </Typography>
              </TableContainer>
            )}
          </Box>
        )}

        {contract && Number(nivel_lei) > 0 && (
          <Box sx={{ mt: 3 }}>
            {loadingPlati ? (
              <CircularProgress size={20} />
            ) : (
              <>
                <Typography
                  sx={{
                    fontWeight: "bold",
                    fontSize: "1.1rem",
                    color: soldRamas > 0 ? "error.main" : "success.main",
                  }}
                >
                  Sold rămas de plată: {soldRamas.toFixed(2)} lei
                </Typography>
                {/* 
                {valoarePlataNoua > 0 && (
                  <Typography
                    sx={{
                      mt: 1,
                      color:
                        valoarePlataNoua > soldRamas
                          ? "error.main"
                          : "info.main",
                      fontWeight: "bold",
                    }}
                  >
                    Valoare in lei a produselor pentru plată nouă:{" "}
                    {valoarePlataNoua.toFixed(2)} lei
                    {valoarePlataNoua > soldRamas && " ⚠️ DEPĂȘEȘTE SOLDUL!"}
                  </Typography>
                )} */}
              </>
            )}
          </Box>
        )}

        <Paper sx={{ p: { xs: 1.5, sm: 2 }, mt: 3 }}>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "1fr 1fr",
                md: "1fr 1fr 1fr",
              },
              gap: { xs: 2, md: 3 },
              mb: 3,
            }}
          >
            <TextField
              label="Nivel Arenda Lei/ha"
              value={nivel_lei}
              onChange={(e) => setNivel_lei(Number(e.target.value))}
              fullWidth
              size="small"
              helperText={
                pretCulturaLipsa
                  ? `Anul ${anSelectat} nu are preț ${tipPlata} configurat — completează manual sau setează prețul în „Prețuri pe an”.`
                  : " "
              }
              error={pretCulturaLipsa}
            />
            <TextField
              type="date"
              label="Data Emitere (Oblio issueDate)"
              value={dataEmitereOblio.split("-").reverse().join("-")}
              onChange={(e) => {
                const [year, month, day] = e.target.value.split("-");
                setDataEmitereOblio(`${day}-${month}-${year}`);
              }}
              InputLabelProps={{ shrink: true }}
              variant="outlined"
              fullWidth
              size="small"
            />
            <TextField
              label="Cantitate"
              value={cantitate}
              onChange={(e) => setCantitate(e.target.value)}
              onBlur={() => {
                // Formatare doar când iese din câmp
                if (cantitate && !isNaN(Number(cantitate))) {
                  setCantitate(parseFloat(String(cantitate)).toFixed(2));
                }
              }}
              fullWidth
              size="small"
            />
          </Box>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "1fr 1fr",
                md: "1fr 1fr 1fr",
              },
              gap: { xs: 2, md: 3 },
              mb: 3,
            }}
          >
            <FormControl size="small" disabled={loading} fullWidth>
              <InputLabel>Tip Plata</InputLabel>
              <Select
                label="Tip Plata"
                value={tipPlata}
                onChange={(e) => setTipPlata(e.target.value)}
              >
                <MenuItem value="lei">Lei</MenuItem>
                <MenuItem value="porumb">porumb </MenuItem>
                <MenuItem value="grau">grau </MenuItem>
              </Select>
            </FormControl>

            <FormControl size="small" disabled={loading} fullWidth>
              <InputLabel>Metoda plată</InputLabel>
              <Select
                label="Metoda plată"
                value={metodaPlata}
                onChange={(e) => setMetodaPlata(e.target.value)}
              >
                <MenuItem value="cash">Cash</MenuItem>
                <MenuItem value="transfer">Transfer Bancar</MenuItem>
                <MenuItem value="ridicare">Ridicare</MenuItem>
              </Select>
            </FormControl>
          </Box>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "1fr 1fr",
                md: "1fr 1fr 1fr",
              },
              gap: { xs: 2, md: 3 },
              mb: 3,
            }}
          >
            <TextField
              label="Observații"
              multiline
              rows={4}
              value={observatii}
              onChange={(e) => setObservatii(e.target.value)}
              fullWidth
              size="small"
            />
          </Box>
        </Paper>

        <Button
          variant="contained"
          disabled={loading}
          color="primary"
          onClick={handleGenerareChitanta}
          sx={{ width: { xs: "100%", sm: "auto" } }}
        >
          {loading ? "Se generează..." : "Generează Chitanță"}
        </Button>
      </Paper>
      {qrData && (
        <Paper sx={{ p: { xs: 1.5, sm: 2 }, mt: 3 }}>
          <Typography variant="h6">Chitanță Generată</Typography>

          {/* QR Code */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              my: 2,
              "& svg": { width: "100%", height: "auto", maxWidth: 256 },
            }}
          >
            <QRCodeSVG
              value={JSON.stringify({
                uuid: qrData.uuid,
                contract: contract?.nr_contract,
                an: anSelectat,
                tip: qrData.tip_plata,
                cantitate: qrData.cantitate,
                valoare_lei: qrData.valoare_lei,
                arendator: contract?.arendator?.nume,
                verify_url: `${window.location.origin}/verify/${qrData.uuid}`,
              })}
              size={256}
              level="M"
            />
          </Box>

          {/* Detalii plată */}
          <Typography>Nume: {contract?.arendator?.nume}</Typography>
          <Typography>
            Contract Nr: {contract?.nr_contract}/ {contract?.data_contract}
          </Typography>
          <Typography>Tip plată: {qrData.tip_plata}</Typography>
          <Typography>
            Cantitate: {parseFloat(qrData.cantitate).toFixed(2)}{" "}
            {qrData.tip_plata === "lei" ? "LEI" : "kg"}
          </Typography>
          <Typography>
            Valoare echivalent LEI: {qrData.valoare_lei} lei
          </Typography>
          {qrData.pret_kg && (
            <Typography>Preț/kg: {qrData.pret_kg} lei/kg</Typography>
          )}
          <Typography>
            Data Chitanță: {formatDataDDMMYYYY(qrData.data_generarii)}
          </Typography>
          <Typography>
            Data Emitere (Oblio): {formatDataDDMMYYYY(qrData.created_at)}
          </Typography>
          <Typography>UUID: {qrData.uuid}</Typography>
        </Paper>
      )}
    </Box>
  );
};
