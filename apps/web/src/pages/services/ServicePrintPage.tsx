import { useParams } from 'react-router-dom';
import { useService, usePlanItems } from '../../features/services/hooks';

export default function ServicePrintPage() {
  const { id } = useParams();
  const { data: service } = useService(id);
  const { data: plan } = usePlanItems(id);

  const handlePrint = () => window.print();

  return (
    <div className="p-4 print:p-0">
      <div className="mb-4 flex justify-between print:block">
        <h1 className="text-xl font-semibold">
          {service?.startsAt ? new Date(service.startsAt).toLocaleString() : 'Service'}
          {service?.location ? ` - ${service.location}` : ''}
        </h1>
        <button
          onClick={handlePrint}
          className="px-2 py-1 text-sm bg-blue-500 text-white rounded print:hidden"
        >
          Print
        </button>
      </div>
      {plan && plan.length > 0 ? (
        <ol className="space-y-2 list-decimal list-inside">
          {plan.map((item) => (
            <li key={item.id} className="capitalize">
              <div>{item.type}</div>
              {item.notes && <div className="text-sm whitespace-pre-line">{item.notes}</div>}
            </li>
          ))}
        </ol>
      ) : (
        <div>No items</div>
      )}
    </div>
  );
}
