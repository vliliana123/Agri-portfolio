import React from "react";
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton ,
  Tooltip
} from "@mui/material";
import {
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import { Contract } from "../../types";

import { formatDate, calculateExpiryYear } from "../../services/api";


// Funcție pentru calcul an expirare


export interface ContracteTableProps {
  contracte: Contract[];
  onViewDetails: (contract: Contract) => void;
  onEdit: (contract: Contract) => void;
  onDelete: (id: number) => Promise<void>;
}

export const ContracteTable = React.memo(
  ({ contracte, onViewDetails, onEdit, onDelete }: ContracteTableProps) => {
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
            width: "100%",
            "& .MuiTableCell-root": {
              px: { xs: 1, sm: 2 },
            },
          }}
        >
          <TableHead>
            <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
              <TableCell
                sx={{
                  whiteSpace: "normal",
                  wordWrap: "break-word",
                  fontWeight: "bold",
                 
                }}
              >
                Arendator
              </TableCell>
              <TableCell
                sx={{
                  whiteSpace: "nowrap",
                  fontWeight: "bold",
                  width: "100px",
                  textAlign: "center",
                }}
              >
                Contract
              </TableCell>
              <TableCell
                sx={{
                  whiteSpace: "nowrap",
                  fontWeight: "bold",
                  width: "110px",
                  textAlign: "center",
                   
                }}
              >
                Data
              </TableCell>
              <TableCell
                sx={{
                  whiteSpace: "nowrap",
                  fontWeight: "bold",
                  width: "130px",
                  textAlign: "center",
                  display: { xs: "none", md: "table-cell" },

                }}
              >
                Perioada
              </TableCell>
              <TableCell
                sx={{
                  whiteSpace: "nowrap",
                  fontWeight: "bold",
                  width: "100px",
                  textAlign: "center",
                  display: { xs: "none", md: "table-cell" },

                }}
              >
                Expira
              </TableCell>
              <TableCell
                sx={{
                  whiteSpace: "nowrap",
                  fontWeight: "bold",
                  width: 130,
                  textAlign: "center",
                }}
              >
                Acțiuni
              </TableCell>

            </TableRow>
          </TableHead>
          <TableBody>
            {contracte.map((contract: Contract) => (
              <TableRow key={contract.id_contract} hover>
                <TableCell
                  sx={{
                    whiteSpace: "normal",
                    wordWrap: "break-word",
                    fontSize: "0.875rem",
                    
                  }}
                >
                  {contract.arendator.nume}
                </TableCell>
                <TableCell
                  sx={{
                    whiteSpace: "nowrap",
                    width: "100px",
                    fontSize: "0.875rem",
                    textAlign: "center",
                  }}
                >
                  {contract.nr_contract}
                </TableCell>
                <TableCell
                  sx={{
                    whiteSpace: "nowrap",
                    width: "110px",
                    fontSize: "0.875rem",
                    textAlign: "center",
                    

                  }}
                >
                  {formatDate(contract.data_contract)}
                </TableCell>
                <TableCell
                  sx={{
                    whiteSpace: "nowrap",
                    width: "130px",
                    fontSize: "0.875rem",
                    textAlign: "center",
                    display: { xs: "none", md: "table-cell" },

                  }}
                >
                  {contract.perioada_contract}
                </TableCell>
                <TableCell
                  sx={{
                    whiteSpace: "nowrap",
                    width: "100px",
                    fontSize: "0.875rem",
                    textAlign: "center",
                    display: { xs: "none", md: "table-cell" },

                  }}
                >
                  {calculateExpiryYear(
                    contract.data_contract,
                    contract.perioada_contract,
                  )}
                </TableCell>
                <TableCell sx={{ whiteSpace: "nowrap", textAlign: "center" }}>
                  <Tooltip title="Detalii">
                    <IconButton size="small" onClick={() => onViewDetails(contract)}>
                      <VisibilityIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Editează">
                    <IconButton size="small" onClick={() => onEdit(contract)}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Șterge">
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => onDelete(contract.id_contract)}
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

ContracteTable.displayName = "ContracteTable";
