'use server';

import { mkdir, unlink, writeFile } from 'fs/promises';
import path from 'path';
import { randomUUID } from 'crypto';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/session-utils';
import { revalidatePath } from 'next/cache';

const allowedTypes = new Map([
  ['image/jpeg', '.jpg'],
  ['image/png', '.png'],
  ['image/webp', '.webp'],
  ['image/gif', '.gif'],
]);

async function getUserId() {
  const session = await getSession();
  if (!session.userId) throw new Error('Unauthorized');
  return session.userId;
}

export async function addGalleryImage(formData: FormData) {
  const userId = await getUserId();
  const file = formData.get('file');
  const caption = ((formData.get('caption') as string) || '').trim().slice(0, 120);

  if (!(file instanceof File) || file.size === 0) return { error: 'Pilih foto terlebih dahulu.' };
  const extension = allowedTypes.get(file.type);
  if (!extension) return { error: 'Format foto harus JPG, PNG, WebP, atau GIF.' };
  if (file.size > 8 * 1024 * 1024) return { error: 'Ukuran foto maksimal 8 MB.' };

  try {
    const uploadDirectory = path.join(process.cwd(), 'public', 'uploads', 'gallery');
    await mkdir(uploadDirectory, { recursive: true });
    const filename = `${userId}-${randomUUID()}${extension}`;
    await writeFile(path.join(uploadDirectory, filename), Buffer.from(await file.arrayBuffer()));
    await prisma.galleryImage.create({ data: { userId, path: `/uploads/gallery/${filename}`, caption } });
    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error('Add gallery image error:', error);
    return { error: 'Foto gagal disimpan.' };
  }
}

export async function deleteGalleryImage(imageId: number) {
  const userId = await getUserId();
  const image = await prisma.galleryImage.findFirst({ where: { id: imageId, userId } });
  if (!image) return { error: 'Foto tidak ditemukan.' };

  try {
    await prisma.galleryImage.delete({ where: { id: imageId } });
    const relativePath = image.path.replace(/^\//, '');
    await unlink(path.join(process.cwd(), 'public', relativePath)).catch(() => undefined);
    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error('Delete gallery image error:', error);
    return { error: 'Foto gagal dihapus.' };
  }
}