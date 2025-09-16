import { useParams } from 'react-router-dom';
import { useService, usePlanItems } from '../../features/services/hooks';
import { usePlanArrangementInfo, type ArrangementInfo } from '@/features/services/usePlanArrangementInfo';

export default function ServicePrintPage() {
  const { id } = useParams();
  const { data: service } = useService(id);
  const { data: plan } = usePlanItems(id);
  const arrangementInfo = usePlanArrangementInfo(plan);

  const formatType = (type?: string | null) => {
    if (!type) return 'Item';
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  const formatArrangementDetails = (info?: ArrangementInfo) => {
    if (!info) return '';
    const parts: string[] = [];
    if (info.key) parts.push(`Key ${info.key}`);
    if (info.bpm != null) parts.push(`${info.bpm} BPM`);
    if (info.meter) parts.push(info.meter);
    return parts.join(' • ');
  };

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
            <li key={item.id}>
              <div className="font-semibold">
                {item.type === 'song' && item.refId
                  ? arrangementInfo[item.refId]?.songTitle ?? 'Song'
                  : formatType(item.type)}
              </div>
              {item.type === 'song' && item.refId && (
                <div className="text-sm text-gray-600">
                  {arrangementInfo[item.refId]
                    ? formatArrangementDetails(arrangementInfo[item.refId]) || null
                    : '…'}
                </div>
              )}
              {item.notes && (
                <div className="text-sm whitespace-pre-line mt-1">{item.notes}</div>
              )}
            </li>
          ))}
        </ol>
      ) : (
        <div>No items</div>
      )}
    </div>
  );
}
