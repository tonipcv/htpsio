'use client';

import { useState } from 'react';
import { Service } from '@/types/service';
import { formatCurrency } from '@/lib/format';

interface ServiceListProps {
  initialServices: Service[];
}

export default function ServiceList({ initialServices }: ServiceListProps) {
  const [services, setServices] = useState(initialServices);

  const handleToggleActive = async (serviceId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/services/${serviceId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive: !currentStatus }),
      });

      if (response.ok) {
        setServices(services.map(service => 
          service.id === serviceId 
            ? { ...service, isActive: !currentStatus }
            : service
        ));
      }
    } catch (error) {
      console.error('Error toggling service status:', error);
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-zinc-800">
        <thead className="bg-zinc-900/50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
              Nome
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
              Categoria
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
              Preço
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-zinc-400 uppercase tracking-wider">
              Ações
            </th>
          </tr>
        </thead>
        <tbody className="bg-transparent divide-y divide-zinc-800">
          {services.map((service) => (
            <tr key={service.id} className="hover:bg-zinc-800/50 transition-colors">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-white">{service.name}</div>
                {service.description && (
                  <div className="text-sm text-zinc-400">{service.description}</div>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-400">
                {service.category || '-'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                {formatCurrency(service.price)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span
                  className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    service.is_active
                      ? 'bg-emerald-950/50 text-emerald-400 border border-emerald-800'
                      : 'bg-red-950/50 text-red-400 border border-red-800'
                  }`}
                >
                  {service.is_active ? 'Ativo' : 'Inativo'}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button
                  onClick={() => handleToggleActive(service.id, service.is_active)}
                  className="text-blue-400 hover:text-blue-300 transition-colors mr-4"
                >
                  {service.is_active ? 'Desativar' : 'Ativar'}
                </button>
                <a
                  href={`/dashboard/services/${service.id}/edit`}
                  className="text-blue-400 hover:text-blue-300 transition-colors"
                >
                  Editar
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {services.length === 0 && (
        <div className="text-center py-8 text-zinc-400 bg-zinc-900/50 rounded-lg border border-zinc-800 shadow-[0_8px_30px_rgba(0,0,0,0.3)]">
          Nenhum serviço cadastrado ainda.
        </div>
      )}
    </div>
  );
} 