import React, { useEffect, useState } from "react";
import {
  Box,
  CircularProgress,
  Alert,
  Typography,
  Input,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Select,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { getContracte, api } from "../services/api";
import { useNavigate } from "react-router-dom";
import { Contract, PlatiArenda } from "../types";

interface PlataEdit extends PlatiArenda {
  isModified: boolean;
}

export const PlatiArendaPage = () => {
  const [contracte, setContracte] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState("");
  const theme = useTheme();
  const esteMobil = useMediaQuery(theme.breakpoints.down("sm"));

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedContract, setSelectedContract] = useState<Contract | null>(
    null,
  );
  const [platiList, setPlatiList] = useState<PlataEdit[]>([]);
  const [platiLoading, setPlatiLoading] = useState(false);
  const [platiError, setPlatiError] = useState("");

  // Când revii din edit, repopula căutarea
 useEffect(() => {
  const term = searchText.trim();
  if (!term) {
    setContracte([]);
    return;
  }
  
  const timer = setTimeout(async () => {
    try {
      setError("");
      setLoading(true);
      const response = await getContracte(50, 0, term);
      setContracte(response.results || []);
    } catch (err: any) {
      setError(err.response?.data?.error || "Eroare la căutare");
    } finally {
      setLoading(false);
    }
  }, 200);  // ← debounce 200ms (vezi explicație jos)
  
  return () => clearTimeout(timer);
}, [searchText]);


  const handleListaPlati = async (contract: Contract) => {
    setSelectedContract(contract);
    setModalOpen(true);
    setPlatiLoading(true);
    setPlatiError("");

    try {
      const response = await api.get("/plati-arenda/lista_plati/", {
        params: {
          nr_contract: contract.nr_contract,
          data_contract: contract.data_contract,
        },
      });

      const plati = (response.data.results || []).map((p: any) => ({
        ...p,
        isModified: false,
      }));
      setPlatiList(plati);
    } catch (err: any) {
      setPlatiError("Eroare la încărcarea plăților");
      console.error(err);
    } finally {
      setPlatiLoading(false);
    }
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setSelectedContract(null);
    setPlatiList([]);
  };

  const handleSavePlata = async (plata: PlataEdit) => {
    try {
      const updateData = {
        tip_plata: plata.tip_plata,
        status: plata.status,
        observatii: plata.observatii,
        data_plata: plata.data_plata ? plata.data_plata : null,
      };

      await api.patch(`/plati-arenda/${plata.id_plata}/`, updateData);

      // Refetch plăți pentru a reflecta schimbarea
      if (selectedContract) {
        const response = await api.get("/plati-arenda/lista_plati/", {
          params: {
            nr_contract: selectedContract.nr_contract,
            data_contract: selectedContract.data_contract,
          },
        });

        const updatedPlati = (response.data.results || []).map((p: any) => ({
          ...p,
          isModified: false,
        }));
        setPlatiList(updatedPlati);
      }

      setPlatiError("");
    } catch (err: any) {
      setPlatiError(
        "Eroare la salvare: " + (err.response?.data?.error || err.message),
      );
    }
  };

  const handleDeletePlata = async (plata: PlataEdit) => {
    if (
      window.confirm(`Ești sigur că vrei să ștergi plata ${plata.id_plata}?`)
    ) {
      try {
        await api.delete(`/plati-arenda/${plata.id_plata}/`);

        const newPlati = platiList.filter((p) => p.id_plata !== plata.id_plata);
        setPlatiList(newPlati);

        setPlatiError("");
      } catch (err: any) {
        setPlatiError(
          "Eroare la ștergere: " + (err.response?.data?.error || err.message),
        );
      }
    }
  };

  return (
        <Box sx={{ p: { xs: 1.5, sm: 2.5 } }}>
          <Typography
            variant="h4"
            sx={{ fontWeight: 600, mb: 2, fontSize: { xs: "1.5rem", sm: "2rem" } }}
          >
            Plăți Arendă - Căutare
          </Typography>

        <Box sx={{ mb: 2.5, maxWidth: { xs: "100%", sm: 400 } }}>

          <Typography>Caută după Nume Arendator sau CNP</Typography>
          <Input autoFocus
            type="text"
            placeholder="ex: Ion Popescu sau 1234567890123"
            value={searchText}
            
            onChange={(e) => setSearchText(e.target.value)}
            fullWidth
          />
        </Box>

     

      {loading && <CircularProgress />}
      {error && <Alert severity="error">{error}</Alert>}

      {contracte.length > 0 && (
        <Box sx={{ mt: 2.5, overflowX: "auto" }}>
          <Typography variant="h6" sx={{ mb: 1 }}>
            Contracte ({contracte.length})
          </Typography>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 480 }}>

            <thead>
              <tr style={{ borderBottom: "2px solid #ddd" }}>
                <th style={{ padding: "10px", textAlign: "left" }}>
                  Nr Contract
                </th>
                <th style={{ padding: "10px", textAlign: "left" }}>
                  Data Contract
                </th>
                <th style={{ padding: "10px", textAlign: "left" }}>
                  Arendator
                </th>
                <th style={{ padding: "10px", textAlign: "center" }}>
                  Acțiuni
                </th>
              </tr>
            </thead>
            <tbody>
              {contracte.map((contract: Contract) => (
                <tr
                  key={contract.id_contract}
                  style={{ borderBottom: "1px solid #ddd" }}
                >
                  <td style={{ padding: "10px" }}>{contract.nr_contract}</td>
                  <td style={{ padding: "10px" }}>{contract.data_contract}</td>
                  <td style={{ padding: "10px" }}>{contract.arendator.nume}</td>
                                    <td style={{ padding: "10px", textAlign: "center" }}>
                    <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, gap: 1, "& .MuiButton-root": { whiteSpace: "nowrap"}, }}>
                      <Button
                        size="small"
                        variant="contained"
                        onClick={() => handleListaPlati(contract)}
                      >
                        Lista Plăți
                      </Button>
                      <Button
                        size="small"
                        variant="contained"
                        onClick={() =>
                          navigate(`/contracte/${contract.id_contract}/arenda`)
                        }
                      >
                        Adauga Plati
                      </Button>
                    </Box>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </Box>
      )}

      {/* MODAL PENTRU LISTA PLATI */}
           <Dialog
        open={modalOpen}
        onClose={handleModalClose}
        maxWidth="lg"
        fullWidth
        fullScreen={esteMobil}
        PaperProps={{
          sx: {
            minHeight: { xs: "100%", sm: "80vh" },
            maxHeight: { xs: "100%", sm: "90vh" },
          },
        }}
      >

        <DialogTitle sx={{ fontSize: { xs: "1.1rem", sm: "1.25rem" }, px: { xs: 2, sm: 3 } }}>
          Lista Plăți - Contract {selectedContract?.nr_contract}
        </DialogTitle>
        <DialogContent sx={{ overflowY: "auto", px: { xs: 1, sm: 3 } }}>

          {platiLoading && <CircularProgress />}
          {platiError && <Alert severity="error">{platiError}</Alert>}

          {!platiLoading && platiList.length === 0 && (
            <Typography>Nu sunt plăți pentru acest contract.</Typography>
          )}

          {!platiLoading && platiList.length > 0 && (
            <Box sx={{ overflowX: "auto", mt: 2.5 }}>
              <table
                style={{
                  width: "100%",
                  minWidth: 900,
                  borderCollapse: "collapse",
                }}
              >
                <thead>
                  <tr
                    style={{
                      borderBottom: "2px solid #ddd",
                      backgroundColor: "#f5f5f5",
                    }}
                  >
                    <th style={{ padding: "10px", textAlign: "center" }}>#</th>
                    <th style={{ padding: "10px", textAlign: "center" }}>
                      An Arendă
                    </th>
                    <th style={{ padding: "10px", textAlign: "left" }}>
                      Tip Plată
                    </th>
                    <th style={{ padding: "10px", textAlign: "left" }}>
                      Data Generării
                    </th>
                    <th style={{ padding: "10px", textAlign: "left" }}>
                      Data Plată
                    </th>
                    <th style={{ padding: "10px", textAlign: "right" }}>
                      Cantitate
                    </th>
                    <th style={{ padding: "10px", textAlign: "left" }}>
                      Status
                    </th>
                    <th style={{ padding: "10px", textAlign: "left" }}>
                      Observații
                    </th>
                    <th style={{ padding: "10px", textAlign: "center" }}>
                      Acțiuni
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {platiList.map((plata, index) => (
                    <tr
                      key={plata.uuid}
                      style={{ borderBottom: "1px solid #ddd" }}
                    >
                      <td
                        style={{
                          padding: "10px",
                          textAlign: "center",
                          fontWeight: "bold",
                        }}
                      >
                        {index + 1}
                      </td>
                      <td style={{ padding: "10px", textAlign: "center" }}>
                        {plata.an_arenda}
                      </td>
                      <td style={{ padding: "10px" }}>
                        <Select
                          value={plata.tip_plata}
                          onChange={(e) => {
                            const newPlati = [...platiList];
                            newPlati[index].tip_plata = e.target.value;
                            newPlati[index].isModified = true;
                            setPlatiList(newPlati);
                          }}
                          size="small"
                          fullWidth
                        >
                          <MenuItem value="lei">Lei</MenuItem>
                          <MenuItem value="grau">Grâu</MenuItem>
                          <MenuItem value="porumb">Porumb</MenuItem>
                        </Select>
                      </td>
                      <td style={{ padding: "10px" }}>
                        <TextField
                          type="date"
                          value={
                            plata.data_generarii
                              ? plata.data_generarii.split("T")[0]
                              : ""
                          }
                          onChange={(e) => {
                            const newPlati = [...platiList];
                            newPlati[index].data_generarii = e.target.value;
                            newPlati[index].isModified = true;
                            setPlatiList(newPlati);
                          }}
                          size="small"
                          fullWidth
                          InputLabelProps={{ shrink: true }}
                        />
                      </td>
                      <td style={{ padding: "10px" }}>
                        <TextField
                          type="date"
                          value={
                            plata.data_plata
                              ? plata.data_plata.split("T")[0]
                              : ""
                          }
                          onChange={(e) => {
                            const newPlati = [...platiList];
                            newPlati[index].data_plata = e.target.value;
                            newPlati[index].isModified = true;
                            setPlatiList(newPlati);
                          }}
                          size="small"
                          fullWidth
                          InputLabelProps={{ shrink: true }}
                        />
                      </td>
                      <td style={{ padding: "10px", textAlign: "right" }}>
                        <TextField
                          value={parseFloat(String(plata.cantitate || 0)).toFixed(2)}
                          disabled
                          size="small"
                          fullWidth
                          inputProps={{ readOnly: true }}
                        />
                      </td>
                      <td style={{ padding: "10px" }}>
                        <Select
                          value={plata.status}
                          onChange={(e) => {
                            const newPlati = [...platiList];
                            newPlati[index].status = e.target.value;
                            newPlati[index].isModified = true;
                            setPlatiList(newPlati);
                          }}
                          size="small"
                          fullWidth
                        >
                          <MenuItem value="generata">Generată</MenuItem>
                          <MenuItem value="platita">Plătită</MenuItem>
                          <MenuItem value="anulata">Anulată</MenuItem>
                        </Select>
                      </td>
                      <td style={{ padding: "10px" }}>
                        <TextField
                          value={plata.observatii || ""}
                          onChange={(e) => {
                            const newPlati = [...platiList];
                            newPlati[index].observatii = e.target.value;
                            newPlati[index].isModified = true;
                            setPlatiList(newPlati);
                          }}
                          size="small"
                          fullWidth
                          multiline
                          rows={1}
                        />
                      </td>
                      <td style={{ padding: "10px", whiteSpace: "nowrap" }}>
                        <Box
                          sx={{
                            display: "flex",
                            gap: 0.5,
                            justifyContent: "center",
                          }}
                        >
                        {plata.isModified && (
                          <Button
                            size="small"
                            variant="contained"
                            color="success"
                            onClick={() => handleSavePlata(plata)}
                          >
                            Save
                          </Button>
                        )}
                        <Button
                          size="small"
                          variant="contained"
                          color="primary"
                          onClick={() =>
                            window.open(`/chitanta/${plata.uuid}`, "_blank")
                          }
                        >
                          QR
                        </Button>
                        <Button
                          size="small"
                          variant="contained"
                          color="error"
                          onClick={() => handleDeletePlata(plata)}
                        >
                          Delete
                        </Button>
                        </Box>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleModalClose}>Închide</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
