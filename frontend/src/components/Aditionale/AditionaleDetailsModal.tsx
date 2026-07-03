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
  <Dialog open={open} onClose={onClose}>
    <DialogTitle>Detalii Aditional</DialogTitle>
    <DialogContent>
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