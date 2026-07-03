import React, { useState, useEffect } from "react";
import {
  getContractDetails,
  updateContract,
  updateTeren
} from "../services/api";
import {
  Box,
  Paper,
  Select,
  InputLabel,
  MenuItem,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Alert,
  FormControl,
} from "@mui/material";
import { ArrowBack, Save } from "@mui/icons-material";
import { useNavigate, useParams } from "react-router-dom";
import { useContext } from "react";
import { BreadcrumbContext } from "../context/BreadcrumbContext";
import { Teren } from "../types";
import { useZone } from "../hooks/useZone";

export const ContracteEditPage: React.FC = () => {
  const navigate = useNavigate();
  const { setBreadcrumbLabel } = useContext(BreadcrumbContext);
  const { id } = useParams<{ id: string }>();
  const { zone } = useZone();

  const [contractForm, setContractForm] = useState({
    id_arendator: 0,
    nr_contract: "",
    data_contract: "",
    perioada_contract: "",
    nivel_arenda: "",
    observatii: "",
  });
  const [terenuriForm, setTerenuriForm] = useState<Teren[]>([]);

  // loadingData = “iau datele existente din API înainte de afișare”
  // loading = “trimit modificările la API în formularul deja afișat”
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Încarcă datele contractului la montarea componentei
  useEffect(() => {
    const loadContracte = async () => {
      try {
        setLoadingData(true);
        setBreadcrumbLabel(""); // Reset label before loading new data
        if (!id) {
          setError("ID contract invalid");
          return;
        }
        const data = await getContractDetails(Number(id));
        setContractForm({
          id_arendator: data.arendator.id_arendator,
          nr_contract: data.nr_contract,
          data_contract: data.data_contract,
          perioada_contract: data.perioada_contract,
          nivel_arenda: data.nivel_arenda,
          observatii: data.observatii ?? "",
        });

        setTerenuriForm(
          data.terenuri?.map((t) => ({
            id_teren: t.id_teren,
            id_zona: t.id_zona,
            act_proprietate: t.act_proprietate ?? "",
            nr_act_proprietate: t.nr_act_proprietate ?? "",
            data_act_proprietate: t.data_act_proprietate ?? "",
            suprafata: t.suprafata ?? "",
            tarla: t.tarla ?? "",
            parcela: t.parcela ?? "",
            vecin_nord: t.vecin_nord ?? "",
            vecin_est: t.vecin_est ?? "",
            vecin_sud: t.vecin_sud ?? "",
            vecin_vest: t.vecin_vest ?? "",
            categorie_teren: t.categorie_teren ?? "",
            zona_nume: t.zona_nume ?? "",
          })) ?? [],
        );
        setBreadcrumbLabel(`Contract ${data.nr_contract}`);
      } catch (err: any) {
        const errorMsg =
          err?.response?.data?.error ||
          err?.message ||
          "Eroare la încărcarea contractului";
        setError(errorMsg);
        console.error("Eroare:", err);
      } finally {
        setLoadingData(false);
      }
    };

    loadContracte();
  }, [id, setBreadcrumbLabel]);

  const validateForm = () => {
    const errors: string[] = [];

    if (!contractForm.nr_contract.trim())
      errors.push("Numărul de contract este obligatoriu");
    if (!contractForm.data_contract.trim())
      errors.push("Data contractului este obligatorie");

    if (!contractForm.perioada_contract.trim())
      errors.push("Perioada este obligatorie");
    if (!contractForm.nivel_arenda.trim())
      errors.push("Nivelul este obligatoriu");

    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      setError(validationErrors.join(", "));
      return;
    }
    try {
      setLoading(true);
      setError(null);
      if (!id) {
        setError("ID contract invalid");
        return;
      }
      // // Mapează id_arendator → arendator (backend așteaptă "arendator", nu "id_arendator")
      // const contractPayload = {
      //   arendator: contractForm.id_arendator,
      //   nr_contract: contractForm.nr_contract,
      //   data_contract: contractForm.data_contract,
      //   perioada_contract: contractForm.perioada_contract,
      //   nivel_arenda: contractForm.nivel_arenda,
      //   observatii: contractForm.observatii,
      // };

      await updateContract(Number(id), contractForm);

      // Update toate terenurile
      for (const teren of terenuriForm) {
        if (teren.id_teren) {
          const terenPayload = {
  contract: Number(id),
  arendator: contractForm.id_arendator,
  zona: teren.id_zona,
  act_proprietate: teren.act_proprietate,
  nr_act_proprietate: teren.nr_act_proprietate,
  data_act_proprietate:
    teren.data_act_proprietate === "0000-00-00"
      ? null
      : teren.data_act_proprietate,
  suprafata: teren.suprafata,
  tarla: teren.tarla,
  parcela: teren.parcela,
  vecin_nord: teren.vecin_nord,
  vecin_est: teren.vecin_est,
  vecin_sud: teren.vecin_sud,
  vecin_vest: teren.vecin_vest,
  categorie_teren: teren.categorie_teren,
};
await updateTeren(Number(teren.id_teren), terenPayload);
        }
      }

      setSuccess(true);
      setTimeout(() => {
        navigate(`/contracte/${id}/detalii/`);
      }, 2000);
    } catch (err: any) {
      const errorMsg =
        err?.response?.data?.error ||
        err?.message ||
        "Eroare la actualizarea contractului";
      setError(errorMsg);
      console.error("Eroare:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange =
    (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setContractForm({
        ...contractForm,
        [field]: e.target.value,
      });
    };

  const handleTerenChange =
    (index: number, field: string) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const updatedTerenuri = [...terenuriForm];
      updatedTerenuri[index] = {
        ...updatedTerenuri[index],
        [field]: e.target.value,
      };
      setTerenuriForm(updatedTerenuri);
    };

  const handleZoneChange = (
    index: number,
    zonaId: number,
    zonaNume: string,
  ) => {
    const updatedTerenuri = [...terenuriForm];
    updatedTerenuri[index] = {
      ...updatedTerenuri[index],
      id_zona: zonaId,
      zona_nume: zonaNume,
    };
    setTerenuriForm(updatedTerenuri);
  };

  if (loadingData) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        backgroundColor: "white",
        minHeight: { xs: "auto", sm: "100vh" },
        p: { xs: 1.5, sm: 2, md: 3 },
      }}
    >
      {/* Header cu buton înapoi */}
      <Box
        sx={{
          mb: { xs: 2, sm: 3 },
          display: "flex",
          alignItems: "center",
          gap: { xs: 1, sm: 2 },
          flexWrap: "wrap",
        }}
      >
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate(`/contracte/${id}/detalii/`)}
          variant="outlined"
          disabled={loading}
        >
          Înapoi la Detalii
        </Button>
        <Typography
          variant="h4"
          component="h1"
          sx={{
            fontSize: { xs: "1.5rem", sm: "2rem" },
            lineHeight: { xs: 1.3, sm: 1.2 },
          }}
        >
          Editare Contract
        </Typography>
      </Box>

      {/* Success Message */}
      {success && (
        <Alert
          severity="success"
          sx={{ mb: 3, maxWidth: { xs: "100%", sm: "90%", md: "80%" } }}
        >
          Arendator actualizat cu succes! Redirectare în curs...
        </Alert>
      )}

      {/* Error Message */}
      {error && (
        <Alert
          severity="error"
          sx={{ mb: 3, maxWidth: { xs: "100%", sm: "90%", md: "80%" } }}
        >
          {error}
        </Alert>
      )}

      <Box sx={{ maxWidth: { xs: "100%", sm: "90%", md: "80%" } }}>
        <Paper sx={{ p: { xs: 1, sm: 1.5, md: 2 } }}>
          <form onSubmit={handleSubmit}>
            <Typography variant="h6" sx={{ mb: 2, color: "primary.main" }}>
              Informații Arendator
            </Typography>

            {/* Layout în 3 coloane */}
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  sm: "1fr 1fr",
                  md: "1fr 1fr 1fr",
                },
                gap: { xs: 2, md: 3 },
              }}
            >
              {/* Numar contract */}
              <TextField
                label="Numar Contract"
                value={contractForm.nr_contract}
                onChange={handleInputChange("nr_contract")}
                fullWidth
                required
                size="small"
                variant="outlined"
                disabled={loading || loadingData}
              />

              {/* Data Contract */}
              <TextField
                label="Data Contract"
                type="date"
                value={contractForm.data_contract || ""}
                onChange={handleInputChange("data_contract")}
                fullWidth
                required
                size="small"
                disabled={loading || loadingData}
             
              />

              {/* Perioada Contract */}
              <TextField
                label="Perioada Contract"
                value={contractForm.perioada_contract}
                onChange={handleInputChange("perioada_contract")}
                fullWidth
                required
                size="small"
                variant="outlined"
                disabled={loading || loadingData}
                inputProps={{ maxLength: 13 }}
                helperText="13 cifre"
              />

              {/* Nivel Arendă */}
              <TextField
                label="Nivel Arendă"
                value={contractForm.nivel_arenda}
                onChange={handleInputChange("nivel_arenda")}
                fullWidth
                required
                size="small"
                variant="outlined"
                disabled={loading || loadingData}
              />

              {/* Observații */}
              <TextField
                label="Observatii"
                value={contractForm.observatii}
                onChange={handleInputChange("observatii")}
                fullWidth
                size="small"
                variant="outlined"
                disabled={loading || loadingData}
              />
            </Box>

            {/* Secțiunea Terenuri */}
            <Typography
              variant="h6"
              sx={{ mt: 3, mb: 2, color: "primary.main" }}
            >
              Terenuri ({terenuriForm.length})
            </Typography>

            {terenuriForm.map((teren, index) => (
              <Paper
                key={index}
                sx={{ p: 2, mb: 2, bgcolor: "grey.50" }}
                variant="outlined"
              >
                <Typography
                  variant="subtitle2"
                  sx={{ mb: 1.5, fontWeight: "bold" }}
                >
                  Teren {index + 1}
                </Typography>
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: {
                      xs: "1fr",
                      sm: "1fr 1fr",
                      md: "1fr 1fr 1fr",
                    },
                    gap: 2,
                  }}
                >
                  <TextField
                    label="Act proprietate"
                    value={teren.act_proprietate}
                    size="small"
                    onChange={handleTerenChange(index, "act_proprietate")}
                    disabled={loading || loadingData}
                  />
                  <TextField
                    label="Nr Act Proprietate"
                    value={teren.nr_act_proprietate}
                    size="small"
                    onChange={handleTerenChange(index, "nr_act_proprietate")}
                    disabled={loading || loadingData}
                  />
                  <TextField
                    label="Data Act Proprietate"
                    type="date"
                    value={teren.data_act_proprietate}
                    onChange={handleTerenChange(index, "data_act_proprietate")}
                    fullWidth
                    size="small"
                    variant="outlined"
                    disabled={loading}
                    InputLabelProps={{ shrink: true }}
                  />
                  <TextField
                    label="Suprafață (ha)"
                    value={teren.suprafata}
                    size="small"
                    onChange={handleTerenChange(index, "suprafata")}
                    disabled={loading || loadingData}
                  />
                  <TextField
                    label="Tarla"
                    value={teren.tarla}
                    size="small"
                    onChange={handleTerenChange(index, "tarla")}
                    disabled={loading || loadingData}
                  />
                  <TextField
                    label="Parcela"
                    value={teren.parcela}
                    size="small"
                    onChange={handleTerenChange(index, "parcela")}
                    disabled={loading || loadingData}
                  />
                  <FormControl
                    fullWidth
                    required
                    size="small"
                    disabled={loading}
                  >
                    <InputLabel>Zonă</InputLabel>
                    <Select
                      label="Zona"
                      value={teren.id_zona ?? ""}
                      size="small"
                      onChange={(e) => {
                        const selectedId = Number(e.target.value);
                        const selectedZone = zone.find(
                          (z) => z.id_zona === selectedId,
                        );
                        if (selectedZone) {
                          handleZoneChange(
                            index,
                            selectedZone.id_zona,
                            selectedZone.nume,
                          );
                        }
                      }}
                    >
                      {zone.map((z) => (
                        <MenuItem key={z.id_zona} value={z.id_zona}>
                          {z.nume}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <TextField
                    label="Vecin Nord"
                    value={teren.vecin_nord}
                    size="small"
                    onChange={handleTerenChange(index, "vecin_nord")}
                    disabled={loading || loadingData}
                  />
                  <TextField
                    label="Vecin Est"
                    value={teren.vecin_est}
                    size="small"
                    onChange={handleTerenChange(index, "vecin_est")}
                    disabled={loading || loadingData}
                  />
                  <TextField
                    label="Vecin Sud"
                    value={teren.vecin_sud}
                    size="small"
                    onChange={handleTerenChange(index, "vecin_sud")}
                    disabled={loading || loadingData}
                  />
                  <TextField
                    label="Vecin Vest"
                    value={teren.vecin_vest}
                    size="small"
                    onChange={handleTerenChange(index, "vecin_vest")}
                    disabled={loading || loadingData}
                  />
                  <TextField
                    label="Categorie Teren"
                    value={teren.categorie_teren}
                    size="small"
                    onChange={handleTerenChange(index, "categorie_teren")}
                    disabled={loading || loadingData}
                  />
                </Box>
              </Paper>
            ))}

            {/* Butoane de acțiune */}
            <Box sx={{ display: "flex", gap: 2, mt: 4, flexWrap: "wrap" }}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                startIcon={<Save />}
                disabled={loading || loadingData}
                sx={{ minWidth: { xs: "100%", sm: "auto" } }}
              >
                {loading ? "Se salvează..." : "Salvare Modificări"}
              </Button>
              <Button
                variant="outlined"
                onClick={() => navigate(`/contracte/${id}`)}
                disabled={loading}
                sx={{ minWidth: { xs: "100%", sm: "auto" } }}
              >
                Anulare
              </Button>
            </Box>
          </form>
        </Paper>
      </Box>
    </Box>
  );
};
