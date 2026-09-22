import React from "react";
import { AditionaleTableProps } from "../../types";
import {
  Table,
  TableRow,
  TableContainer,
  TableCell,
  TableBody,
  TableHead,
  Paper,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
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
          sx={{ "& .MuiTableCell-root": { px: { xs: 1, sm: 2 }, py: 0.75 } }}
        >
          <TableHead>
            <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
              <TableCell
                sx={{ fontWeight: "bold"  }}
              >
                Nume
              </TableCell>
              <TableCell
                sx={{ whiteSpace: "nowrap", fontWeight: "bold"  }}
              >
                Nr. aditional
              </TableCell>
              <TableCell
                sx={{ whiteSpace: "nowrap", fontWeight: "bold" }}
              >
                Data Incepere
              </TableCell>
              <TableCell
                sx={{ whiteSpace: "nowrap", fontWeight: "bold"  }}
              >
                Perioada
              </TableCell>
              <TableCell
                sx={{ whiteSpace: "nowrap", fontWeight: "bold" }}
              >
                Expira
              </TableCell>
              <TableCell sx={{ whiteSpace: "nowrap", fontWeight: "bold", width: 130 }}>
                Acțiuni
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {aditionale.map((aditional) => (
              <TableRow key={aditional.id_aditional}>
                <TableCell >
                  {aditional.contract?.arendator?.nume || "N/A"}
                </TableCell>
                <TableCell
                  sx={{
                    whiteSpace: "nowrap",
                     
                    textAlign: "center",
                  }}
                >
                  {aditional.nr_aditional}
                </TableCell>
                <TableCell
                  sx={{
                    whiteSpace: "nowrap",
                     
                    textAlign: "center",
                  }}
                >
                  {formatDate(aditional.data_aditional) ?? "N/A"}
                </TableCell>
                <TableCell
                  sx={{
                    whiteSpace: "nowrap",
                     
                    fontSize: "0.85rem",
                    textAlign: "center",
                  }}
                >
                  {aditional.perioada_aditional}
                </TableCell>
                <TableCell
                  sx={{
                    whiteSpace: "nowrap",
                     
                    textAlign: "center",
                  }}
                >
                  {calculateExpiryYear(
                    aditional.data_aditional,
                    aditional.perioada_aditional,
                  )}
                </TableCell>
                <TableCell sx={{ whiteSpace: "nowrap" }}>
                  <Tooltip title="Detalii">
                    <IconButton size="small" onClick={() => onViewDetails(aditional)}>
                      <VisibilityIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Editează">
                    <IconButton size="small" onClick={() => onEdit(aditional)}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Șterge">
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => onDelete(aditional.id_aditional)}
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
