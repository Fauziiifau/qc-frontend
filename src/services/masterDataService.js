import api from '../api/axiosConfig';

// PART
export const getAllParts = () => api.get('/parts').then(res => res.data);
export const saveMasterPart = (data) => api.post('/parts', data).then(res => res.data);
export const deleteMasterPart = (id) => api.delete(`/parts/${id}`);

// MACHINE
export const getMasterMachines = () => api.get('/machines').then(res => res.data);
export const saveMasterMachine = (data) => api.post('/machines', data).then(res => res.data);
export const deleteMasterMachine = (id) => api.delete(`/machines/${id}`);

// DEFECT TYPE
export const getMasterDefects = () => api.get('/defects').then(res => res.data);
export const saveMasterDefect = (data) => api.post('/defects', data).then(res => res.data);
export const deleteMasterDefect = (id) => api.delete(`/defects/${id}`);

// Backward-compat aliases
export const getAllDefectTypes = getMasterDefects;
export const getAllDefects = getMasterDefects;