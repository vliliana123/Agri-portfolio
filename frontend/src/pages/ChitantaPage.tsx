import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Box,
  Paper,
  Typography,
  CircularProgress,
  Alert,
  Button,
} from "@mui/material";
import QRCodeSVG from "react-qr-code";
import { PlataDetails } from "../types";
import { api, getMultiplePlatiArenda, emitPlataInOblio } from "../services/api";

export const ChitantaPage = () => {
  const { uuid } = useParams<{ uuid: string }>();
  const [plata, setPlata] = useState<PlataDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [markingPaid, setMarkingPaid] = useState(false);
  const [emitOblio, setEmitOblio] = useState(false);
  const [oblioMessage, setOblioMessage] = useState("");

  useEffect(() => {
    const loadPlata = async () => {
      try {
        if (uuid) {
          const platiArray = await getMultiplePlatiArenda([uuid]);
          setPlata(platiArray[0] || null);
        }
      } catch (err: any) {
        setError(err.response?.data?.error || "Plata nu a fost găsită");
      } finally {
        setLoading(false);
      }
    };

    if (uuid) {
      loadPlata();
    }
  }, [uuid]);

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "400px",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error || !plata) {
    return (
      <Box sx={{ padding: 3 }}>
        <Alert severity="error">{error || "Chitanța nu a fost găsită"}</Alert>
      </Box>
    );
  }

  const handleEmitOblio = async () => {
    if (!plata?.uuid) return;

    try {
      setEmitOblio(true);
      setError("");

      const result = await emitPlataInOblio(plata.uuid);

      setPlata((prev) =>
        prev
          ? {
              ...prev,
              oblio_status: result.oblio_status,
              oblio_invoice_id: result.oblio_invoice_id,
              oblio_link: result.oblio_link,
              oblio_submitted_at: result.oblio_submitted_at,
            }
          : prev,
      );
      setOblioMessage(result.message || "Factura trimisa in Oblio cu succes.");
    } catch (err: any) {
      setError(
        err.response?.data?.error || "Eroare la trimiterea facturii in Oblio",
      );
    } finally {
      setEmitOblio(false);
    }
  };
  const handlePaid = async () => {
    try {
      await api.post(`/plati-arenda/${plata.uuid}/mark-paid/`);
      // Reîncarcă datele complete cu nested structure
      setMarkingPaid(true);
      const [updatedPlata] = await getMultiplePlatiArenda([plata.uuid]);
      setPlata(updatedPlata);
      
      alert("Plată marcată cu succes!");
    } catch (err: any) {
      setError(
        err.response?.data?.error || "Eroare la marcarea plății ca efectuată",
      );
      } finally {
        setMarkingPaid(false);
      }
    }
 

  return (
    <Box sx={{ padding: 3, maxWidth: "800px", margin: "0 auto" }}>
      <Paper sx={{ padding: 3 }}>
        <Typography variant="h5" sx={{ mb: 3, textAlign: "center" }}>
          Chitanță Plată Arendă
        </Typography>

        {/* QR Code */}
        <Box sx={{ display: "flex", justifyContent: "center", marginY: 3 }}>
          <QRCodeSVG
            value={JSON.stringify({
              uuid: plata.uuid,
              contract: plata.arenda.contract.nr_contract,
              an: plata.arenda.an_arenda,
              tip: plata.tip_plata,
              cantitate: plata.cantitate,
              valoare_lei: plata.valoare_lei,
              arendator: plata.arenda.contract.arendator.nume,
              verify_url: `${window.location.origin}/verify/${plata.uuid}`,
            })}
            size={256}
            level="Q"
          />
        </Box>

        {/* Detalii plată */}
        <Box sx={{ mt: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Detalii Plată
          </Typography>
          <Button onClick={window.print} variant="outlined" sx={{ mb: 2 }}>
            Print
          </Button>
          <Button onClick={handlePaid} variant="outlined" 
          disabled={markingPaid||plata.status==="platita"|| plata.status==="anulata"} 
          sx={{ mb: 2 }}>
            Mark as Paid
          </Button>
          <Button
            onClick={handleEmitOblio}
            variant="outlined"
            sx={{ mb: 2 }}
            disabled={emitOblio || plata.oblio_status === "SUBMITTED"}
          >
            {emitOblio ? "Se trimite..." : "Adauga in Oblio"}
          </Button>

          {/* //Oblio status and message */}
          { plata.oblio_status||plata.oblio_invoice_id||plata.oblio_submitted_at ? (
            <Box sx={{ displayPrint: 'none', variant: "outlined", mb: 2, mt: 2, p: 2, borderColor: 'primary.main' }}> 
          {oblioMessage && (
            <Alert severity="success" sx={{ mt: 2 }}>
              {oblioMessage}
            </Alert>
          )}
          {plata.oblio_status && (
            <Typography sx={{ mt: 2 }}>
              <strong>Status Oblio:</strong> {plata.oblio_status}
            </Typography>
          )}
          {plata.oblio_invoice_id && (
            <Typography>
              {" "}
              <strong>Factura Oblio:</strong> {plata.oblio_invoice_id}{" "}
            </Typography>
          )}
          {plata.oblio_submitted_at && (
            <Typography>
              {" "}
              <strong>Data Trimiterii Oblio:</strong> {new Date(plata.oblio_submitted_at).toLocaleString("ro-RO")}{" "}
            </Typography>
          )}

          {/* {plata.oblio_link && (
            <Typography>
              {" "}
              <strong>Link Oblio:</strong>{" "}
              <a href={plata.oblio_link} target="_blank" rel="noreferrer">
                {" "}
                Deschide factura{" "}
              </a>{" "}
            </Typography>
          )} */}
          </Box>) : null}

          <Typography>
            <strong>Arendator:</strong> {plata.arenda.contract.arendator.nume}
          </Typography>
          <Typography>
            <strong>CNP:</strong> {plata.arenda.contract.arendator.cnp}
          </Typography>
          <Typography>
            <strong>Telefon:</strong> {plata.arenda.contract.arendator.telefon}
          </Typography>

          <Typography sx={{ mt: 2 }}>
            <strong>Contract Nr:</strong> {plata.arenda.contract.nr_contract}
          </Typography>
          <Typography>
            <strong>Data Contract:</strong>{" "}
            {plata.arenda.contract.data_contract}
          </Typography>
          <Typography>
            <strong>An Arendă:</strong> {plata.arenda.an_arenda}
          </Typography>

          <Typography sx={{ mt: 2 }}>
            <strong>Tip Plată:</strong> {plata.tip_plata}
          </Typography>
          <Typography>
            <strong>Cantitate:</strong> {plata.cantitate}{" "}
            {plata.tip_plata === "lei" ? "LEI" : "kg"}
          </Typography>
          <Typography>
            <strong>Valoare echivalent LEI:</strong> {plata.valoare_lei} lei
          </Typography>

          {plata.pret_kg && (
            <Typography>
              <strong>Preț/kg:</strong> {plata.pret_kg} lei/kg
            </Typography>
          )}

          {plata.metoda_plata && (
            <Typography sx={{ mt: 2 }}>
              <strong>Metodă Plată:</strong> {plata.metoda_plata}
            </Typography>
          )}

          <Typography sx={{ mt: 2 }}>
            <strong>Status:</strong> {plata.status}
          </Typography>
          <Typography>
            <strong>Data Generării:</strong>{" "}
            {new Date(plata.data_generarii).toLocaleString("ro-RO")}
          </Typography>

          {plata.observatii && (
            <Typography sx={{ mt: 2 }}>
              <strong>Observații:</strong> {plata.observatii}
            </Typography>
          )}
          <Typography sx={{ mt: 2 }}> Semnatura Primire </Typography>
          <Typography sx={{ mt: 5 }}>__________________________</Typography>
          <Typography sx={{ mt: 3 }}> Semnatura Predare </Typography>
          <Typography sx={{ mt: 5 }}>__________________________</Typography>
          <Typography
            sx={{ mt: 3, fontSize: "0.9rem", color: "text.secondary" }}
          >
            <strong>UUID:</strong> {plata.uuid}
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};
