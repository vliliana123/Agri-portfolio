import {
  Paper,
  TableContainer,
  Table,
  TableHead,
  TableCell,
  TableRow,
  IconButton,
  TableBody,
  Tooltip,
} from "@mui/material";
import {
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
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
        <Table
            size="small"
            sx={{
              "& .MuiTableCell-root": {
                px: { xs: 1, sm: 2 },
              },
            }}
          >

          <TableHead>
            <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
              <TableCell sx={{  fontWeight: "bold" }}>
                Nume
              </TableCell>
              <TableCell sx={{ whiteSpace: "nowrap", fontWeight: "bold", display: { xs: "table-cell", sm: "table-cell" } }}>
                  CNP
                </TableCell>


              <TableCell
                sx={{
                  whiteSpace: "nowrap",
                  fontWeight: "bold",
                  width: "140px",
                  display: { xs: "none", sm: "table-cell" }
                }}
              >
                Telefon
              </TableCell>
              <TableCell sx={{ whiteSpace: "nowrap", fontWeight: "bold", display: { xs: "none", md: "table-cell" } }}>
                Adresa
              </TableCell>

              <TableCell sx={{ whiteSpace: "nowrap", fontWeight: "bold" , width: 130}}>
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
                <TableCell sx={{ whiteSpace: "nowrap", display: { xs: "table-cell", sm: "table-cell" } }}>
                  {arendator.cnp}
                </TableCell>


                <TableCell sx={{ whiteSpace: "nowrap", width: "140px" ,display: { xs: "none", sm: "table-cell" }}}>
                  {arendator.telefon}
                </TableCell>
                <TableCell
                  sx={{
                    maxWidth: 250,
                    wordWrap: "break-word",
                    whiteSpace: "normal",
                    display: { xs: "none", md: "table-cell" },
                  }}
                >
                  {arendator.adresa}
                </TableCell>
                <TableCell sx={{ whiteSpace: "nowrap" }}>
                  <Tooltip title="Detalii">
                    <IconButton size="small" onClick={() => onViewDetails(arendator)}>
                      <VisibilityIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Editează">
                    <IconButton size="small" onClick={() => onEdit(arendator)}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Șterge">
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => onDelete(arendator.id_arendator)}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </TableCell>

              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  },
);
