const express = require('express');
const { DefaultAzureCredential } = require('@azure/identity');
const { SecretClient } = require('@azure/keyvault-secrets');


const app = express();
app.use(express.json());


const kvUri = process.env.KEYVAULT_URI || '';
const credential = new DefaultAzureCredential();
const client = new SecretClient(kvUri, credential);


app.get('/health', (req, res) => {
res.json({ status: 'ok' });
});


app.get('/secret/:name', async (req, res) => {
const name = req.params.name;
try {
const sec = await client.getSecret(name);
res.json({ value: sec.value });
} catch (err) {
res.status(500).json({ error: err.message });
}
});


const port = process.env.PORT || 3000;
app.listen(port, () => console.log('server running on', port));