# Prompt: Cambio de Configuración de Red (localhost a IP específica)

## Objetivo
Actualizar todas las configuraciones de red del proyecto para cambiar de `localhost` a una IP específica (por ejemplo: `10.211.55.5`).

## Contexto
Este cambio es necesario cuando el entorno de desarrollo requiere que el backend y frontend se ejecuten en una IP diferente a localhost, como cuando se usa Docker en máquinas virtuales o configuraciones de red específicas.

## Archivos a Modificar

### Frontend (4 archivos)

#### 1. `frontend/.env`
**Acción:** Crear o actualizar el archivo con las variables de entorno

```env
REACT_APP_API_URL=http://[IP]:3010
REACT_APP_FRONTEND_URL=http://[IP]:3000
```

#### 2. `frontend/src/components/AddCandidateForm.js`
**Cambio:** Actualizar la URL del fetch en la función `handleSubmit`

**De:**
```javascript
const res = await fetch('http://localhost:3010/candidates', {
```

**A:**
```javascript
const res = await fetch('http://[IP]:3010/candidates', {
```

#### 3. `frontend/src/components/FileUploader.js`
**Cambio:** Actualizar la URL del fetch en la función `handleFileUpload`

**De:**
```javascript
const res = await fetch('http://localhost:3010/upload', {
```

**A:**
```javascript
const res = await fetch('http://[IP]:3010/upload', {
```

#### 4. `frontend/src/services/candidateService.js`
**Cambios:** Actualizar ambos endpoints en las funciones `uploadCV` y `sendCandidateData`

**De:**
```javascript
const response = await axios.post('http://localhost:3010/upload', formData, {
// ...
const response = await axios.post('http://localhost:3010/candidates', candidateData);
```

**A:**
```javascript
const response = await axios.post('http://[IP]:3010/upload', formData, {
// ...
const response = await axios.post('http://[IP]:3010/candidates', candidateData);
```

### Backend (2 archivos)

#### 5. `backend/prisma/schema.prisma`
**Cambio:** Actualizar la URL de conexión de PostgreSQL en el datasource

**De:**
```prisma
datasource db {
  provider = "postgresql"
  url      = "postgresql://LTIdbUser:D1ymf8wyQEGthFR1E9xhCq@localhost:5432/LTIdb"
}
```

**A:**
```prisma
datasource db {
  provider = "postgresql"
  url      = "postgresql://LTIdbUser:D1ymf8wyQEGthFR1E9xhCq@[IP]:5432/LTIdb"
}
```

#### 6. `backend/src/index.ts`
**Cambios:** Actualizar CORS origin y mensaje de consola

**De:**
```typescript
// Middleware para permitir CORS desde http://localhost:3000
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));

// ...

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
```

**A:**
```typescript
// Middleware para permitir CORS desde http://[IP]:3000
app.use(cors({
  origin: 'http://[IP]:3000',
  credentials: true
}));

// ...

app.listen(port, () => {
  console.log(`Server is running at http://[IP]:${port}`);
});
```

## Ejemplo de Solicitud

```
Necesito cambiar la configuración de red del proyecto de localhost a [IP_ESPECIFICA].

Por favor, actualiza los siguientes archivos:

Frontend:
- frontend/.env (crear/actualizar con variables de entorno)
- frontend/src/components/AddCandidateForm.js
- frontend/src/components/FileUploader.js
- frontend/src/services/candidateService.js

Backend:
- backend/prisma/schema.prisma (URL de PostgreSQL)
- backend/src/index.ts (CORS y mensaje de consola)

Reemplaza todas las instancias de localhost con [IP_ESPECIFICA] en:
- URLs de API (http://localhost:3010 → http://[IP_ESPECIFICA]:3010)
- URLs de frontend (http://localhost:3000 → http://[IP_ESPECIFICA]:3000)
- URL de base de datos (localhost:5432 → [IP_ESPECIFICA]:5432)

Solo realiza estos cambios de configuración de red, no modifiques nada más.
```

## Notas Importantes

1. **Puertos:**
   - Backend: 3010
   - Frontend: 3000
   - PostgreSQL: 5432

2. **Credenciales de base de datos:** Mantener las mismas credenciales existentes en `schema.prisma`

3. **CORS:** Asegurarse de actualizar el origin en el backend para permitir peticiones desde la nueva IP del frontend

4. **Variables de entorno:** El archivo `.env` del frontend puede estar en `.gitignore`, pero debe crearse localmente

5. **Reinicio necesario:** Después de estos cambios, será necesario:
   - Reiniciar el servidor backend
   - Reiniciar el servidor de desarrollo del frontend
   - Posiblemente regenerar el cliente Prisma: `npx prisma generate`

## Verificación

Después de aplicar los cambios, verificar:
- [ ] El backend inicia correctamente y muestra la IP en el mensaje de consola
- [ ] El frontend puede conectarse al backend
- [ ] Las peticiones CORS no son bloqueadas
- [ ] El backend se conecta correctamente a la base de datos
- [ ] Las subidas de archivos funcionan correctamente
- [ ] El formulario de agregar candidatos funciona correctamente

## Tags
`#configuración` `#red` `#localhost` `#ip` `#cors` `#docker` `#prisma` `#frontend` `#backend`
