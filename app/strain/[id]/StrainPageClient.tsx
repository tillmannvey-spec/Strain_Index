'use client';

import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useStrain } from '../../hooks/useStrains';
import StrainDetail from '../../components/StrainDetail';
import AddStrainForm from '../../components/AddStrainForm';
import EmptyState from '../../components/EmptyState';
import { Strain } from '../../types/strain';

interface StrainPageClientProps {
  id: string;
}

export default function StrainPageClient({ id }: StrainPageClientProps) {
  const router = useRouter();
  const { strain, isLoading, error, updateStrain, deleteStrain } = useStrain(id);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const handleEdit = useCallback((updatedData: Omit<Strain, 'id' | 'createdAt' | 'updatedAt'>) => {
    updateStrain(id, updatedData);
    setIsEditOpen(false);
  }, [id, updateStrain]);

  const handleDelete = useCallback(() => {
    if (window.confirm('Bist du sicher, dass du diesen Strain löschen möchtest?')) {
      deleteStrain(id);
      router.push('/');
    }
  }, [id, deleteStrain, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (!strain) {
    return (
      <div className="min-h-screen bg-black pt-20">
        <EmptyState
          icon="error"
          title="Strain nicht gefunden"
          description="Der angeforderte Strain existiert nicht oder wurde gelöscht."
          action={{
            label: 'Zurück zur Übersicht',
            onClick: () => router.push('/'),
          }}
        />
      </div>
    );
  }

  return (
    <>
      <StrainDetail
        strain={strain}
        onEdit={() => setIsEditOpen(true)}
        onDelete={handleDelete}
      />

      {isEditOpen && (
        <AddStrainForm
          initialData={strain}
          onSubmit={handleEdit}
          onCancel={() => setIsEditOpen(false)}
        />
      )}
    </>
  );
}
