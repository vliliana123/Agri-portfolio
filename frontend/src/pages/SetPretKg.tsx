import React,{useState,useEffect} from 'react';
import {
  Box,
  Container,
  Typography,
  Alert,
  Paper,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  IconButton,
} from '@mui/material';
import {Save,Edit, Delete} from '@mui/icons-material';
import {getConfigAnList, createConfigAn, updateConfigAn,deleteConfigAn} from '../services/api';
import {ConfigAn } from '../types';

export const SetPretKg: React.FC = () => {
  const [configList,setConfigList]= useState<ConfigAn[]>([]);
  const [loading,setLoading]= useState<boolean>(false);
  const [success,setSuccess]= useState<string| null>(null);
  const [error,setError]= useState<string| null>(null);

  //form state
  const [formData,setFormData]= useState({
    an: '',
    pret_kg_grau: '',
    pret_kg_porumb: '',
  });
  const [editingId,setEditingId]= useState<number | null>(null);  
  const loadConfigList= async()=>{
  try{  setLoading(true);
    const data= await getConfigAnList();
    setConfigList(data.results||[]);
  }
  catch(err:any){
    setError(err?.response?.data?.message || 'Eroare la încărcarea datelor');
  }
  finally{
    setLoading(false);
  }
}
  useEffect(()=>{
    loadConfigList();
  },[])
 
const handleSubmit= async(e: React.FormEvent)=>{
  e.preventDefault();
  setError(null);
  setSuccess(null);
  //validare simplă
  if(!formData.an || isNaN(Number(formData.an)) || Number(formData.an) < 2000 || Number(formData.an) > 2100){
    setError('Te rog introdu un an valid între 2000 și 2100');
    return;
  }
  if(!formData.pret_kg_grau || isNaN(Number(formData.pret_kg_grau)) || Number(formData.pret_kg_grau) < 0){
    setError('Te rog introdu un preț valid pentru grâu (număr pozitiv)');
    return;
  }
  if(!formData.pret_kg_porumb || isNaN(Number(formData.pret_kg_porumb)) || Number(formData.pret_kg_porumb) < 0){
    setError('Te rog introdu un preț valid pentru porumb (număr pozitiv)');
    return;
  }
  const payload= {
    an: formData.an.trim(),
    pret_kg_grau:formData.pret_kg_grau? parseFloat(formData.pret_kg_grau): null,
    pret_kg_porumb: formData.pret_kg_porumb? parseFloat(formData.pret_kg_porumb): null,
  };
  try{
    setLoading(true);
    if(editingId){
      await updateConfigAn(editingId,{
        an: formData.an,
        pret_kg_grau: Number(formData.pret_kg_grau),
        pret_kg_porumb: Number(formData.pret_kg_porumb),
      });
      setSuccess('Configurație actualizată cu succes');
    } else {//creare noua
      await createConfigAn(payload);
      setSuccess('Configurație creată cu succes');
    }
    resetForm();
    loadConfigList();
  } catch (err: any) {
      let errorMsg = "Eroare la salvare";
      if (err?.response?.data && typeof err.response.data === "object") {
        errorMsg = Object.entries(err.response.data)
          .map(([field, messages]) => {
            const msg = Array.isArray(messages) ? messages.join(", ") : String(messages);
            return `${field}: ${msg}`;
          })
          .join("\n");
      }
      setError(errorMsg);
    }  finally {
    setLoading(false);
  } 
}
const handleEdit=(item: ConfigAn)=>{
    setEditingId(item.id);
  setFormData({
    an: item.an,
    pret_kg_grau: item.pret_kg_grau !== null ? item.pret_kg_grau.toString() : '',
    pret_kg_porumb: item.pret_kg_porumb !== null ? item.pret_kg_porumb.toString() : '',
  });


}
const handleDelete= async(id: number)=>{
  if(!window.confirm('Ești sigur că vrei să ștergi această configurație?')) return; 
  try{
    setLoading(true);
    await deleteConfigAn(id);
    setSuccess('Configurație ștearsă cu succes');
    loadConfigList();
  } catch (err: any) {
    setError(err?.response?.data?.message || 'Eroare la ștergerea configurației');
  }
  finally{
    setLoading(false);
  } 
}
const resetForm=()=>{
  setFormData({
    an: '',
    pret_kg_grau: '',
    pret_kg_porumb: '',
  });
  setEditingId(null);
  setError(null);
  setSuccess(null);
}
  return (
    <Box display="flex" flexDirection="column" alignItems="center" width="100%">
      <Container maxWidth="sm" sx={{ py: 4 }}>
        <Typography variant="h4" sx={{ mb: 3, fontSize: { xs: '1.25rem', sm: '2rem' } }}>
          Setare Preț/kg Grâu și Porumb
        </Typography>
       {/**Form */}
       <Paper sx={{p:2,mb:3,maxWidth:{xs:'100%',md:'95%' }}}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          {editingId ? 'Editează Configurație' : 'Adaugă Configurație Nouă'}
        </Typography>
        {error && (<Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>)}
        {success && (<Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>)}
        <form onSubmit= {handleSubmit}>
          <Box sx={{
            display:'grid',
            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr 1fr' },
            gap:2,
            mb:2
          }}>
            <TextField
              label="An"
              name="an"
              value={formData.an}
              onChange={(e) => setFormData({ ...formData, an: e.target.value })}
              fullWidth
              size="small"
              required
              disabled={!!editingId||loading}
              helperText="Ex: 2024"
              inputProps={{ maxLength: 4 }} 
            />
            <TextField
              label="Preț/kg Grâu"
              name="pret_kg_grau"
              value={formData.pret_kg_grau}
              onChange={(e) => setFormData({ ...formData, pret_kg_grau: e.target.value })}
              fullWidth
              size="small"
              required
              disabled={ loading}
            />
            <TextField
              label="Preț/kg Porumb"
              name="pret_kg_porumb"
              value={formData.pret_kg_porumb}
              onChange={(e) => setFormData({ ...formData, pret_kg_porumb: e.target.value })}
              fullWidth
              size="small"
              required
              disabled={ loading}
            />
          </Box>
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
            <Button
              type="submit"
              variant="contained" startIcon={<Save />}   disabled={loading}>
              {editingId ? 'Salvează Modificările' : 'Adaugă Prețuri'}
              </Button>
              {editingId && (
                <Button
                  variant="outlined" onClick={resetForm} disabled={loading}>
                  Anulează
                </Button>
              )}
          </Box>
        </form>
       </Paper>
              {/* Tabel */}
      <Paper sx={{ p: 2, maxWidth: { xs: "100%", md: "95%" } }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Configurări existente ({configList.length})
        </Typography>
        {loading && configList.length === 0 ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
            <CircularProgress />
          </Box>
        ) : configList.length === 0 ? (
          <Typography color="text.secondary">Nu există configurări. Adaugă prima!</Typography>
        ) : (
          <TableContainer sx={{ overflowX: 'auto' }}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                  <TableCell sx={{ fontWeight: "bold" }}>An</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Preț kg grâu</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Preț kg porumb</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Acțiuni</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {configList.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.an}</TableCell>
                    <TableCell>{item.pret_kg_grau !== null ? item.pret_kg_grau : "-"}</TableCell>
                    <TableCell>{item.pret_kg_porumb !== null ? item.pret_kg_porumb : "-"}</TableCell>
                    <TableCell sx={{ whiteSpace: "nowrap" }}>
                      <IconButton size="small" onClick={() => handleEdit(item)}>
                        <Edit fontSize="small" />
                      </IconButton>
                      <IconButton size="small" color="error" onClick={() => handleDelete(item.id)}>
                        <Delete fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
 
  
      </Container>
    </Box>
  );


};
