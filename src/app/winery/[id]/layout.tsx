import { Metadata } from 'next';
import { dbConnect } from '@/lib/dbConnect';
import WineryModel from '@/models/winery.model';
import React from 'react';

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata(
  { params }: Props
): Promise<Metadata> {
  const { id } = await params;

  try {
    await dbConnect();
    const winery = (await WineryModel.findById(id).lean()) as any;

    if (!winery) {
      return {
        title: 'Winery Not Found | Napa Valley Wineries',
      };
    }

    const name = winery.name || 'Winery';
    const description = winery.description || 'Discover this amazing winery in Napa Valley.';
    // Fallback image if winery has no images
    const image = winery.images && winery.images.length > 0 
      ? winery.images[0] 
      : 'https://app.nvw.wine/default-winery-og.jpg'; // Using the live domain provided

    return {
      title: `${name} | Napa Valley Wineries`,
      description: description.substring(0, 160),
      openGraph: {
        title: `${name} | Napa Valley Wineries`,
        description: description.substring(0, 160),
        images: [
          {
            url: image,
            width: 1200,
            height: 630,
            alt: name,
          },
        ],
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title: name,
        description: description.substring(0, 160),
        images: [image],
      },
    };
  } catch (error) {
    return {
      title: 'Napa Valley Wineries',
    };
  }
}

export default function WineryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
