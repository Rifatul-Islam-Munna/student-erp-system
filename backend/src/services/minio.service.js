import {
    CreateBucketCommand,
    DeleteObjectCommand,
    GetObjectCommand,
    HeadBucketCommand,
    PutBucketPolicyCommand,
    PutObjectCommand,
    S3Client
} from '@aws-sdk/client-s3';
import logger from './logger.service.js';

let s3 = null;
let initialized = false;
let minioUnavailable = false;
const MINIO_BUCKET = 'niqha-public-bukcet';
const MINIO_REGION = 'us-east-1';

const getConfig = () => ({
    endpoint: process.env.MINIO_URL || '',
    accessKeyId: process.env.MINIO_ACCESS_KEY || '',
    secretAccessKey: process.env.MINIO_SECRET_KEY || ''
});

export const isMinioConfigured = () => {
    const config = getConfig();
    return Boolean(config.endpoint && config.accessKeyId && config.secretAccessKey);
};

const streamToBuffer = async (stream) => {
    const chunks = [];
    for await (const chunk of stream) {
        chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    }
    return Buffer.concat(chunks);
};

const ensureClient = () => {
    if (s3) return s3;
    if (minioUnavailable) return null;

    const config = getConfig();
    if (!isMinioConfigured()) {
        return null;
    }

    s3 = new S3Client({
        region: MINIO_REGION,
        endpoint: config.endpoint,
        credentials: {
            accessKeyId: config.accessKeyId,
            secretAccessKey: config.secretAccessKey
        },
        forcePathStyle: true
    });

    return s3;
};

const buildPublicUrl = (key) => {
    const config = getConfig();
    const baseUrl = String(config.endpoint || '').replace(/\/+$/, '');
    return `${baseUrl}/${MINIO_BUCKET}/${key}`;
};

export const initMinioService = async () => {
    const client = ensureClient();
    if (!client || initialized) return;

    try {
        try {
            await client.send(new HeadBucketCommand({ Bucket: MINIO_BUCKET }));
        } catch (error) {
            const statusCode = error?.$metadata?.httpStatusCode;
            if (statusCode === 404 || error?.name === 'NotFound' || error?.name === 'NoSuchBucket') {
                await client.send(new CreateBucketCommand({ Bucket: MINIO_BUCKET }));
            } else {
                throw error;
            }
        }

        const policy = {
            Version: '2012-10-17',
            Statement: [
                {
                    Sid: 'PublicRead',
                    Effect: 'Allow',
                    Principal: '*',
                    Action: ['s3:GetObject'],
                    Resource: [`arn:aws:s3:::${MINIO_BUCKET}/*`]
                }
            ]
        };

        await client.send(new PutBucketPolicyCommand({
            Bucket: MINIO_BUCKET,
            Policy: JSON.stringify(policy)
        }));

        initialized = true;
        logger.info({ bucket: MINIO_BUCKET, endpoint: getConfig().endpoint }, 'MinIO initialized');
    } catch (error) {
        minioUnavailable = true;
        s3 = null;
        logger.warn({ err: error, endpoint: getConfig().endpoint }, 'MinIO unavailable. Falling back to local storage.');
    }
};

export const isMinioEnabled = () => Boolean(ensureClient());

export const uploadBufferToMinio = async ({ buffer, contentType, key }) => {
    const client = ensureClient();

    if (!client) {
        throw new Error(isMinioConfigured() ? 'MinIO is unavailable.' : 'MinIO is not configured.');
    }

    await client.send(new PutObjectCommand({
        Bucket: MINIO_BUCKET,
        Key: key,
        Body: buffer,
        ContentType: contentType || 'application/octet-stream'
    }));

    return {
        key,
        url: buildPublicUrl(key)
    };
};

export const deleteMinioObject = async (key) => {
    const client = ensureClient();

    if (!client || !key) return;

    await client.send(new DeleteObjectCommand({
        Bucket: MINIO_BUCKET,
        Key: key
    }));
};

export const getMinioObjectBuffer = async (key) => {
    const client = ensureClient();

    if (!client || !key) return null;

    const response = await client.send(new GetObjectCommand({
        Bucket: MINIO_BUCKET,
        Key: key
    }));

    if (!response?.Body) return null;
    return streamToBuffer(response.Body);
};

export const getMinioObjectStream = async (key) => {
    const client = ensureClient();

    if (!client || !key) return null;

    const response = await client.send(new GetObjectCommand({
        Bucket: MINIO_BUCKET,
        Key: key
    }));

    return response?.Body || null;
};

export const getMinioPublicUrl = (key) => buildPublicUrl(key);

export const extractMinioKeyFromUrl = (value = '') => {
    const raw = String(value || '').trim();
    if (!raw) return '';
    if (!/^https?:\/\//i.test(raw)) return '';

    try {
        const url = new URL(raw);
        const prefix = `/${MINIO_BUCKET}/`;
        if (!url.pathname.startsWith(prefix)) return '';
        return decodeURIComponent(url.pathname.slice(prefix.length));
    } catch {
        return '';
    }
};
