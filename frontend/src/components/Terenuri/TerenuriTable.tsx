import React from "react";
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip
} from "@mui/material";
import { Visibility as VisibilityIcon } from "@mui/icons-material";

import { Teren } from "../../types";

// Funcție pentru formatare data dd-mm-yyyy
const formatDate = (dateStr: string) => {
  if (!dateStr) return "-";
  try {
    const date = new Date(dateStr);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  } catch {
    return dateStr;
  }
};

export interface TerenuriTableProps {
  terenuri: Teren[];
  onViewDetails: (id_contract: any) => void;
}

export const TerenuriTable = React.memo(
  ({ terenuri, onViewDetails }: TerenuriTableProps) => {
     
    return (
      <TableContainer
        component={Paper}
        sx={{
          width: "100%",
          boxSizing: "border-box",
          overflowX: "auto",
        }}
      >
        <Table
          size="small"
          sx={{
            tableLayout: "auto",
            "& .MuiTableCell-root": {
              px: { xs: 1, sm: 2 },
            },
          }}
        >
          <TableHead>
            <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
              <TableCell sx={{ whiteSpace: "nowrap", fontWeight: "bold" }}>
                Titular
              </TableCell>
              <TableCell
                sx={{
                  whiteSpace: "nowrap",
                  fontWeight: "bold",
                  width: { xs: "70px", sm: "80px", md: "90px" },
                  textAlign: "center",
                }}
              >
                Nr. Contract
              </TableCell>
              <TableCell
                sx={{
                  whiteSpace: "nowrap",
                  fontWeight: "bold",
                  width: { xs: "90px", sm: "100px" },
                  textAlign: "center",
                }}
              >
                Data Contract
              </TableCell>
              <TableCell
                sx={{
                  whiteSpace: "nowrap",
                  fontWeight: "bold",
                  width: { xs: "80px", sm: "90px", md: "100px" },
                  textAlign: "center",
                }}
              >
                Suprafata
              </TableCell>
              <TableCell sx={{ whiteSpace: "nowrap", fontWeight: "bold" }}>
                Zona
              </TableCell>
              <TableCell sx={{ whiteSpace: "nowrap", fontWeight: "bold" }}>
                Acțiuni
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {terenuri.map((teren) => (
              <TableRow key={teren.id_contract} hover>
                <TableCell
                  sx={{
                    whiteSpace: "normal",
                    wordWrap: "break-word",
                    fontSize: "0.875rem",
                  }}
                >
                  {teren.nume_arendator}
                </TableCell>
                <TableCell
                  sx={{
                    whiteSpace: "nowrap",
                    width: { xs: "70px", sm: "80px", md: "90px" },
                    fontSize: "0.875rem",
                    textAlign: "center",
                  }}
                >
                  {teren.nr_contract}
                </TableCell>
                <TableCell
                  sx={{
                    whiteSpace: "nowrap",
                    width: { xs: "90px", sm: "100px" },
                    fontSize: "0.875rem",
                    textAlign: "center",
                  }}
                >
                  {formatDate(teren.data_contract || "")}
                </TableCell>
                <TableCell
                  sx={{
                    whiteSpace: "nowrap",
                    width: { xs: "80px", sm: "90px", md: "100px" },
                    fontSize: "0.875rem",
                    textAlign: "center",
                  }}
                >
                  {teren.suprafata} ha
                </TableCell>
                <TableCell
                  sx={{
                    whiteSpace: "normal",
                    wordWrap: "break-word",
                    fontSize: "0.875rem",
                  }}
                >
                  {teren.zona_nume || "-"}
                </TableCell>
                <TableCell sx={{ whiteSpace: "nowrap" }}>
                  <Tooltip title="Detalii">
                    <IconButton
                      size="small"
                      onClick={() => onViewDetails(teren.id_contract)}
                    >
                      <VisibilityIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </TableCell>

              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  }
);

TerenuriTable.displayName = "TerenuriTable";
