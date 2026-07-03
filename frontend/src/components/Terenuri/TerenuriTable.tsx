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
    // Agregare date: grupeaza după contract, calculează suma suprafață și zone
    // console.log("terenuri primite:", terenuri);
    // const aggregatedData = useMemo(() => {
    //   if (!terenuri || terenuri.length === 0) return [];

    //   const contractMap = new Map<number, any>();

    //   terenuri.forEach((teren) => {
    //     const contractId = teren.contract;
    //     if (!contractId) return;
    //     if (!contractMap.has(contractId)) {
    //       contractMap.set(contractId, {
    //         id_contract: teren.id_contract,
    //         nr_contract: teren.nr_contract,
    //         data_contract: teren.data_contract,
    //         nume_arendator: teren.nume_arendator,
    //         suprafata_totala: 0,
    //         zone_set: new Set<string>(),
    //       });
    //     }

    //     const contractData = contractMap.get(contractId)!;
    //     // Adunăm suprafața
    //     contractData.suprafata_totala += parseFloat(teren.suprafata) || 0;
    //     // Adunăm zona în set (pentru a evita duplicatele)
    //     if (teren.zona_nume) {
    //       contractData.zone_set.add(teren.zona_nume);
    //     }
    //   });

    //   // Convertim Map la array și transformăm set-ul în string cu virgulă
    //   return Array.from(contractMap.values()).map((contract) => ({
    //     ...contract,
    //     zone_string: Array.from(contract.zone_set).join(", "),
    //   }));
    // }, [terenuri]);

    return (
      <TableContainer
        component={Paper}
        sx={{
          width: "100%",
          boxSizing: "border-box",
          overflowX: "auto",
        }}
      >
        <Table sx={{ tableLayout: "auto" }}>
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
                  {teren.suprafata} mp
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
                <TableCell sx={{ whiteSpace: "nowrap", padding: "8px 4px" }}>
                  <Button
                    size="small"
                    onClick={() => onViewDetails(teren.id_contract)}
                    sx={{ textTransform: "none", fontSize: "0.75rem" }}
                  >
                    Detalii
                  </Button>
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
