import sql from "mssql";

const config = {
  user: process.env.AZURE_SQL_USER,
  password: process.env.AZURE_SQL_PASSWORD,
  server: process.env.AZURE_SQL_SERVER,
  database: process.env.AZURE_SQL_DATABASE,
  options: { encrypt: true }
};

export async function saveApplication(app: { encryptedPayload: Buffer, iv: string }) {
  await sql.connect(config);
  await sql.query`
    INSERT INTO Applications (EncryptedPayload, IV, SubmittedAt)
    VALUES (${app.encryptedPayload}, ${app.iv}, GETDATE())
  `;
}

export async function getApplications() {
  await sql.connect(config);
  const result = await sql.query`SELECT * FROM Applications`;
  return result.recordset;
}
