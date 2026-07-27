import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@mui/material/styles";
import { CssBaseline } from "@mui/material";
import { mazerTheme } from "./theme/mazerTheme";
import { MainLayout } from "./components/Layout/MainLayout";
import { ArendatoriPage } from "./pages/ArendatoriPage";
import { ArendatorDetailsPage } from "./pages/ArendatorDetailsPage";
import { ArendatoriAddPage } from "./pages/ArendatoriAddPage";
import { ArendatoriEditPage } from "./pages/ArendatoriEditPage";
import { ContractePage } from "./pages/ContractePage";
import { ContractDetailsPage } from "./pages/ContractDetailsPage";
import { ContracteEditPage } from "./pages/ContracteEditPage";
import { ContracteAddPage } from "./pages/ContracteAddPage";
import { TerenuriPage } from "./pages/TerenuriPage";
import { ArendaPage } from "./pages/ArendaPage";
import { ChitantaPage } from "./pages/ChitantaPage";
import { PlatiArendaPage } from "./pages/PlatiArendaPage";
import { EditPlataArenda } from "./pages/EditPlataArenda";
import { SetPretKg } from "./pages/SetPretKg";
import { LoginContextProvider } from "./context/LoginContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { LoginPage } from "./pages/LoginPage";
import AditionalePage from "./pages/AditionalePage";
import { AditionaleEditPage } from "./pages/AditionaleEditPage";
import { AditionaleAddPage } from "./pages/AditionaleAddPage";
import {RaportPlatiArenda} from "./pages/RaportPlatiArenda";


// Pagini temporare pentru test
const Dashboard = () => (
  <div>
    <h1>Dashboard</h1>
    <p>Bun venit în sistemul de management arendă!</p>
  </div>
);

function App() {
  return (
    <Router>
      <LoginContextProvider>
        <ThemeProvider theme={mazerTheme}>
          <CssBaseline />
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            
            <Route
              path="*"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <Routes>
                      <Route path="/" element={<Dashboard />} />
                        <Route path="/chitanta/:uuid" element={<ChitantaPage />} />
                        <Route path="/verify/:uuid" element={<ChitantaPage />} />
                        <Route path="/arendatori" element={<ArendatoriPage />} />
                        <Route
                          path="/arendatori/:id/edit/"
                          element={<ArendatoriEditPage />}
                        />
                        <Route
                          path="/arendatori/:id"
                          element={<ArendatorDetailsPage />}
                        />
                        <Route path="/arendatori/new/" element={<ArendatoriAddPage />} />

                        <Route
                          path="/contracte/"
                          element={<ContractePage />}
                        />
                        <Route path="/contracte/new/" element={<ContracteAddPage />} />
                        <Route
                          path="/contracte/:id/detalii"
                          element={<ContractDetailsPage />}
                        />
                        <Route path="/contracte/:id_contract/arenda" element={<ArendaPage />} />
                        <Route
                          path="/contracte/:id/edit"
                          element={<ContracteEditPage />}
                        />
                        <Route path="/contracte/rapoarte" element={<RaportPlatiArenda/>} />
                        <Route path="/terenuri/" element={<TerenuriPage />} />
                        <Route path="/plati-arenda" element={<PlatiArendaPage />} />
                        <Route path="/plati-arenda/:id/edit" element={<EditPlataArenda />} />
                        <Route path="/plati-arenda/pret" element={<SetPretKg />} />
                        <Route path="/plati-arenda/raport" element={<RaportPlatiArenda />} />
                        <Route path="/aditionale" element={<AditionalePage />} />
                        <Route path="/aditionale/:id/edit" element={<AditionaleEditPage />} />
                        <Route path="/aditionale/new" element={<AditionaleAddPage />} />

                      </Routes>
                    </MainLayout>
                  </ProtectedRoute>
              }
            />
          </Routes>
        </ThemeProvider>
      </LoginContextProvider>
    </Router>
  );
}

export default App;
