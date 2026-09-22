import React from "react";
import { Aditionale } from "../../types";
import {
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography
} from "@mui/material";
import { formatDate } from "../../services/api";

export const AditionaleDetailsModal = ({ open, onClose, aditional }: { open: boolean; onClose: () => void; aditional: Aditionale | null }) => {
    return (
  <Dialog
    open={open}
    onClose={onClose}
    fullWidth
    maxWidth="sm"
    PaperProps={{ sx: { m: { xs: 1.5, sm: 4 }, width: { xs: "calc(100% - 24px)", sm: "100%" } } }}
  >
    <DialogTitle sx={{ fontSize: { xs: "1.1rem", sm: "1.25rem" }, pb: 1 }}>
      Detalii Aditional
    </DialogTitle>
    <DialogContent sx={{ "& .MuiTypography-root": { fontSize: { xs: "0.9rem", sm: "1rem" }, mb: 0.5 } }}>
      {aditional ? (
        <Box>
          <Typography>Numar Aditional: {aditional.nr_aditional}</Typography>
          <Typography>Data Incepere: {formatDate(aditional.data_aditional) ?? "N/A"}</Typography>
          <Typography>Perioada aditional: {aditional.perioada_aditional}</Typography>
          
          <Typography>Nume: {aditional.contract?.arendator?.nume ?? "N/A"}</Typography>
          <Typography>Numar Contract: {aditional.contract?.nr_contract ?? "N/A"}</Typography>
          <Typography>Data Contract: {formatDate(aditional.contract?.data_contract) ?? "N/A"}</Typography>

        </Box>
      ) : (
        <Typography>Nu există detalii disponibile</Typography>
      )}
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose} color="primary">
        Închide
      </Button>
    </DialogActions>
  </Dialog>)}