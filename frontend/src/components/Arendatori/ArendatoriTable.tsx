import {
  Paper,
  TableContainer,
  Table,
  TableHead,
  TableCell,
  TableRow,
  Button,
  TableBody,
} from "@mui/material";
import { ArendatoriTableProps } from "../../types";
import React from "react";

export const ArendatoriTable = React.memo(
  ({ arendatori, onViewDetails, onEdit, onDelete }: ArendatoriTableProps) => {
    return (
      <TableContainer
        component={Paper}
        sx={{
          width: "100%", //
          overflowX: "auto", // ← pentru scroll orizontal
        }}
      >
        <Table size="small" sx={{ tableLayout: "fixed" }}>
          <TableHead>
            <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
              <TableCell sx={{ whiteSpace: "nowrap", fontWeight: "bold" }}>
                Nume
              </TableCell>
              <TableCell sx={{ whiteSpace: "nowrap", fontWeight: "bold" }}>
                CNP
              </TableCell>

              <TableCell
                sx={{
                  whiteSpace: "nowrap",
                  fontWeight: "bold",
                  width: "140px",
                }}
              >
                Telefon
              </TableCell>
              <TableCell sx={{ whiteSpace: "nowrap", fontWeight: "bold" }}>
                Adresa
              </TableCell>
              <TableCell sx={{ whiteSpace: "nowrap", fontWeight: "bold" }}>
                Acțiuni
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {arendatori.map((arendator) => (
              <TableRow key={arendator.id_arendator}>
                <TableCell sx={{ whiteSpace: "nowrap" }}>
                  {arendator.nume}
                </TableCell>
                <TableCell sx={{ whiteSpace: "nowrap" }}>
                  {arendator.cnp}
                </TableCell>

                <TableCell sx={{ whiteSpace: "nowrap", width: "140px" }}>
                  {arendator.telefon}
                </TableCell>
                <TableCell
                  sx={{
                    maxWidth: 250,
                    wordWrap: "break-word",
                    whiteSpace: "normal",
                  }}
                >
                  {arendator.adresa}
                </TableCell>
                <TableCell sx={{ whiteSpace: "nowrap" }}>
                  <Button size="small" onClick={() => onViewDetails(arendator)}>
                    Detalii{" "}
                  </Button>
                  <Button size="small" onClick={() => onEdit(arendator)}>
                    Edit
                  </Button>
                  <Button
                    size="small"
                    color="error"
                    onClick={() => onDelete(arendator.id_arendator)}
                  >
                    Șterge
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  },
);
