'use client';
import React, { useState, useEffect } from 'react';
import VehicleInfo from '@/components/VehicleInfo';
import PartsSection from '@/components/PartsSection';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';

interface VehicleData {
  licensePlate: string;
  vin: string;
  brand: string;
  model: string;
  year: string;
}

interface VehiclePageClientProps {
  licensePlate: string;
}

export default function VehiclePageClient({ licensePlate }: VehiclePageClientProps) {
  const router = useRouter();
  const [plate, setPlate] = useState(licensePlate.toUpperCase());
  const [vehicleData, setVehicleData] = useState<VehicleData | null>(null);

  useEffect(() => {
    if (plate === '0251FZL') {
      setVehicleData({ licensePlate: plate, vin: '12345678912345678', brand: 'Fiat', model: 'Grande Punto', year: '25/01/2008' });
    } else {
      setVehicleData({ licensePlate: plate, vin: 'Desconocido', brand: 'Desconocida', model: 'Desconocido', year: '-' });
    }
  }, [plate]);

  const handleSearch = () => {
    const p = plate.toUpperCase();
    router.push(`/vehicle/${p}`);
  };

  return (
    <>
      <Header cartItems={0} onAddToCart={() => {}} />
      {vehicleData && (
        <VehicleInfo
          vehicleData={vehicleData}
          plate={plate}
          onPlateChange={setPlate}
          onSearch={handleSearch}
        />
      )}
      {vehicleData && (
        <PartsSection vehicleData={vehicleData} />
      )}
    </>
  );
}
