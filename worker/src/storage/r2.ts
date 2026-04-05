import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { createReadStream } from 'fs'
import { config } from '../config.js'

const client = new S3Client({
  region: 'auto',
  endpoint: `https://${config.r2.accountId}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: config.r2.accessKeyId,
    secretAccessKey: config.r2.secretAccessKey,
  },
})

/**
 * Faz upload de um arquivo local para o R2.
 * Retorna a URL pública do objeto.
 */
export async function uploadFile(
  key: string,
  filePath: string,
  contentType: string
): Promise<string> {
  const stream = createReadStream(filePath)

  await client.send(
    new PutObjectCommand({
      Bucket: config.r2.bucketName,
      Key: key,
      Body: stream,
      ContentType: contentType,
    })
  )

  return `${config.r2.publicUrl}/${key}`
}

/**
 * Faz upload de um Buffer para o R2.
 * Útil para manifests .m3u8 gerados dinamicamente.
 */
export async function uploadBuffer(
  key: string,
  buffer: Buffer,
  contentType: string
): Promise<string> {
  await client.send(
    new PutObjectCommand({
      Bucket: config.r2.bucketName,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    })
  )

  return `${config.r2.publicUrl}/${key}`
}
