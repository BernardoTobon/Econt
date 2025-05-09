import React from "react";

interface ClientDetailsProps {
  cliente: {
    razonSocialONombreCompleto: string;
    numeroDeIdentificacion: string;
    celular: string;
    direccion: string;
    municipiosDepartamentos: string;
  };
  search: string;
  setSearch: (value: string) => void;
  filteredClients: any[];
  handleClientSelect: (client: any) => void;
  handleAddClientClick: () => void;
  showDropdown: boolean;
  setShowDropdown: (value: boolean) => void;
  showAddClientModal: boolean;
  closeAddClientModal: () => void;
  AddClient: React.FC<any>;
  handleClientCreated: (newClient: any) => void;
}

const ClientDetails: React.FC<ClientDetailsProps> = ({
  cliente,
  search,
  setSearch,
  filteredClients,
  handleClientSelect,
  handleAddClientClick,
  showDropdown,
  setShowDropdown,
  showAddClientModal,
  closeAddClientModal,
  AddClient,
  handleClientCreated,
}) => {
  return (
    <div className="grid grid-cols-2 gap-4 mb-6">
      <div className="relative" id="nombreCompletoDropdown">
        <label
          className="block text-gray-700 text-sm font-bold mb-2"
          htmlFor="nombreCompleto"
        >
          Nombre Completo / Razón Social
        </label>
        <input
          id="nombreCompleto"
          className="border p-2 rounded w-full"
          placeholder="Nombre completo o razón social"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setShowDropdown(true);
          }}
          onFocus={() => setShowDropdown(true)}
        />
        {showDropdown && (
          <ul className="absolute z-10 bg-white border border-gray-300 rounded w-full max-h-40 overflow-y-auto">
            {filteredClients.map((client, index) => (
              <li
                key={`client-${client.id}-${index}`}
                className="p-2 hover:bg-gray-100 cursor-pointer"
                onClick={() => handleClientSelect(client)}
              >
                {client.fullName}
              </li>
            ))}
            <li
              key="add-client"
              className="p-2 text-blue-500 hover:underline cursor-pointer"
              onClick={handleAddClientClick}
            >
              Agregar un nuevo cliente
            </li>
          </ul>
        )}
        {showAddClientModal && (
          <div className="fixed inset-0 bg-gray-200 bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-4 rounded shadow-lg w-1/2">
              <button
                className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
                onClick={closeAddClientModal}
              >
                X
              </button>
              <AddClient
                onCloseModal={closeAddClientModal}
                onRegistered={handleClientCreated}
              />
            </div>
          </div>
        )}
      </div>
      <div>
        <label
          className="block text-gray-700 text-sm font-bold mb-2"
          htmlFor="numeroIdentificacion"
        >
          Número de Identificación
        </label>
        <input
          id="numeroIdentificacion"
          className="border p-2 rounded"
          placeholder="Número de identificación"
          value={cliente.numeroDeIdentificacion}
          readOnly
        />
      </div>
      <div>
        <label
          className="block text-gray-700 text-sm font-bold mb-2"
          htmlFor="telefono"
        >
          Teléfono
        </label>
        <input
          id="telefono"
          className="border p-2 rounded"
          placeholder="Teléfono"
          value={cliente.celular}
          readOnly
        />
      </div>
      <div>
        <label
          className="block text-gray-700 text-sm font-bold mb-2"
          htmlFor="direccion"
        >
          Dirección
        </label>
        <input
          id="direccion"
          className="border p-2 rounded"
          placeholder="Dirección"
          value={cliente.direccion}
          readOnly
        />
      </div>
      <div className="col-span-2">
        <label
          className="block text-gray-700 text-sm font-bold mb-2"
          htmlFor="ciudad"
        >
          Ciudad
        </label>
        <input
          id="ciudad"
          className="border p-2 rounded w-full"
          placeholder="Ciudad"
          value={cliente.municipiosDepartamentos}
          readOnly
        />
      </div>
    </div>
  );
};

export default ClientDetails;
