import React from "react";
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
} from "@mui/material";
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
        <Table sx={{ tableLayout: "fixed", width: "100%" }}>
          <TableHead>
            <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
              <TableCell
                sx={{
                  whiteSpace: "normal",
                  wordWrap: "break-word",
                  fontWeight: "bold",
                  flex: 1,
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
                }}
              >
                Expira
              </TableCell>
              <TableCell
                sx={{
                  whiteSpace: "nowrap",
                  fontWeight: "bold",
                  flex: 1,
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
                    flex: 1,
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
                  }}
                >
                  {calculateExpiryYear(
                    contract.data_contract,
                    contract.perioada_contract,
                  )}
                </TableCell>
                <TableCell
                  sx={{
                    whiteSpace: "nowrap",
                    flex: 1,
                    textAlign: "center",
                    padding: "8px 4px",
                  }}>
                  <Button
                    size="small"
                    onClick={() => onViewDetails(contract)}
                    sx={{ textTransform: "none", fontSize: "0.75rem" }}
                  >
                    Detalii
                  </Button>
                  <Button
                    size="small"
                    onClick={() => onEdit(contract)}
                    sx={{ textTransform: "none", fontSize: "0.75rem" }}
                  >
                    Edit
                  </Button>
                  <Button
                    size="small"
                    color="error"
                    onClick={() => onDelete(contract.id_contract)}
                    sx={{ textTransform: "none", fontSize: "0.75rem" }}
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

ContracteTable.displayName = "ContracteTable";
