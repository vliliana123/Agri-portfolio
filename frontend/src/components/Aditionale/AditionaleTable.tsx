import React from "react";
import { AditionaleTableProps } from "../../types";
import {
  Table,
  Button,
  TableRow,
  TableContainer,
  TableCell,
  TableBody,
  TableHead,
  Paper,
} from "@mui/material";
import { formatDate, calculateExpiryYear } from "../../services/api";

export const AditionaleTable = React.memo(
  ({ aditionale, onViewDetails, onEdit, onDelete }: AditionaleTableProps) => {
    return (
      <TableContainer
        component={Paper}
        sx={{
          width: "100%", //
          overflowX: "auto", // ← pentru scroll orizontal
        }}
      >
        <Table
          size="small"
          sx={{ tableLayout: "fixed", "& td": { padding: "6px 4px" } }}
        >
          <TableHead>
            <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
              <TableCell
                sx={{ whiteSpace: "nowrap", fontWeight: "bold", width: "25%" }}
              >
                Nume
              </TableCell>
              <TableCell
                sx={{ whiteSpace: "nowrap", fontWeight: "bold", width: "12%" }}
              >
                Nr. aditional
              </TableCell>
              <TableCell
                sx={{ whiteSpace: "nowrap", fontWeight: "bold", width: "15%" }}
              >
                Data Incepere
              </TableCell>
              <TableCell
                sx={{ whiteSpace: "nowrap", fontWeight: "bold", width: "12%" }}
              >
                Perioada
              </TableCell>
              <TableCell
                sx={{ whiteSpace: "nowrap", fontWeight: "bold", width: "12%" }}
              >
                Expira
              </TableCell>
              <TableCell
                sx={{ whiteSpace: "nowrap", fontWeight: "bold", width: "24%" }}
              >
                Acțiuni
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {aditionale.map((aditional) => (
              <TableRow key={aditional.id_aditional}>
                <TableCell sx={{ whiteSpace: "nowrap", width: "25%" }}>
                  {aditional.contract?.arendator?.nume || "N/A"}
                </TableCell>
                <TableCell
                  sx={{
                    whiteSpace: "nowrap",
                    width: "12%",
                    textAlign: "center",
                  }}
                >
                  {aditional.nr_aditional}
                </TableCell>
                <TableCell
                  sx={{
                    whiteSpace: "nowrap",
                    width: "15%",
                    textAlign: "center",
                  }}
                >
                  {formatDate(aditional.data_aditional) ?? "N/A"}
                </TableCell>
                <TableCell
                  sx={{
                    whiteSpace: "nowrap",
                    width: "12%",
                    fontSize: "0.85rem",
                    textAlign: "center",
                  }}
                >
                  {aditional.perioada_aditional}
                </TableCell>
                <TableCell
                  sx={{
                    whiteSpace: "nowrap",
                    width: "12%",
                    textAlign: "center",
                  }}
                >
                  {calculateExpiryYear(
                    aditional.data_aditional,
                    aditional.perioada_aditional,
                  )}
                </TableCell>
                <TableCell sx={{ whiteSpace: "nowrap", width: "24%" }}>
                  <Button size="small" onClick={() => onViewDetails(aditional)}>
                    Detalii
                  </Button>
                  <Button size="small" onClick={() => onEdit(aditional)}>
                    Edit
                  </Button>
                  <Button
                    size="small"
                    color="error"
                    onClick={() => onDelete(aditional.id_aditional)}
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
