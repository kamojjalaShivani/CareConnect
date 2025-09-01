// import { CareRequestMatches, Provider } from '../../types';
// import { CheckCircle, AlertTriangle, MapPin, Star } from 'lucide-react';
// import { format } from 'date-fns';

// interface ProviderSuggestionsListProps {
//   careRequestMatches: CareRequestMatches | null;
//   dailyProviderSelections: { [date: string]: string };
//   onAssign: (providerId: string, date?: string) => void;
//   assignedProviderId: string | null;
//   isPerDayRequest: boolean; // New prop for conditional sizing
// }

// export default function ProviderSuggestionsList({
//   careRequestMatches,
//   dailyProviderSelections,
//   onAssign,
//   assignedProviderId,
  
// }: ProviderSuggestionsListProps) {
//   if (!careRequestMatches || Object.keys(careRequestMatches.suggestions).length === 0) {
//     return (
//       <div className="text-center py-4 text-gray-500">
//         No provider suggestions available for this care request.
//       </div>
//     );
//   }

//   const renderProviderCard = (provider: Provider, reasons: string[], warnings: string[], date?: string) => {
//     const isAssigned = date
//       ? dailyProviderSelections[date] === provider.id
//       : assignedProviderId === provider.id;

//     return (
//       <div
//         key={provider.id}
//         className={`border rounded-lg p-4 mb-3 shadow-sm ${
//           isAssigned ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white'
//         } last:mb-0`}
//       >
//         <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2">
//           <h5 className="text-md font-semibold text-gray-900">{provider.name}</h5>
//           {provider.rating && (
//             <div className="flex items-center text-sm text-yellow-500 sm:ml-auto">
//               <Star className="w-4 h-4 fill-current mr-1" />
//               <span>{provider.rating.toFixed(1)}</span>
//             </div>
//           )}
//         </div>
//         <div className="flex flex-wrap items-center gap-x-4 mb-2">
//           <p className="text-sm text-gray-600">
//             Specialties: {provider.specialties.join(', ')}
//           </p>
//           <p className="text-sm text-gray-600 flex items-center">
//             <MapPin className="w-4 h-4 mr-1 text-gray-500" />
//             {provider.location}
//           </p>
//         </div>

//         {reasons.length > 0 && (
//           <div className="mt-2">
//             <h6 className="text-xs font-medium text-green-700 mb-1">Reasons to Assign:</h6>
//             <ul className="list-disc list-inside text-xs text-green-600 space-y-0.5">
//               {reasons.map((reason, i) => (
//                 <li key={i} className="flex items-center">
//                   <CheckCircle className="w-3 h-3 mr-1 text-green-500 flex-shrink-0" />
//                   {reason}
//                 </li>
//               ))}
//             </ul>
//           </div>
//         )}

//         {warnings.length > 0 && (
//           <div className="mt-2">
//             <h6 className="text-xs font-medium text-red-700 mb-1">Warnings:</h6>
//             <ul className="list-disc list-inside text-xs text-red-600 space-y-0.5">
//               {warnings.map((warning, i) => (
//                 <li key={i} className="flex items-center">
//                   <AlertTriangle className="w-3 h-3 mr-1 text-red-500 flex-shrink-0" />
//                   {warning}
//                 </li>
//               ))}
//             </ul>
//           </div>
//         )}

//         <button
//           onClick={() => onAssign(provider.id, date)}
//           className={`mt-3 w-full px-3 py-2 text-sm font-medium rounded-md transition-colors ${
//             isAssigned
//               ? 'bg-gray-300 text-gray-700 cursor-not-allowed'
//               : 'bg-blue-600 text-white hover:bg-blue-700'
//           }`}
//           disabled={isAssigned}
//         >
//           {careRequestMatches.mode === 'consistent'
//             ? 'Assign Provider for All Days'
//             : 'Assign Provider for This Date'}
//         </button>
//       </div>
//     );
//   };

//   return (
//     <div className="space-y-6">
//       {careRequestMatches.mode === 'consistent' && (
//         <div>
//           <h3 className="text-lg font-semibold text-gray-800 mb-3">Consistent Provider Suggestions</h3>
//           {careRequestMatches.suggestions.map((suggestion: any) =>
//             renderProviderCard(suggestion.provider, suggestion.reasons, suggestion.warnings)
//           )}
//         </div>
//       )}

//       {careRequestMatches.mode === 'per_day' && (
//         <div>
//           <h3 className="text-lg font-semibold text-gray-800 mb-3">Provider Suggestions Per Day</h3>
//           <div className="flex overflow-x-auto space-x-4 pb-4"> {/* Changed to horizontal scroll */}
//             {Object.keys(careRequestMatches.suggestions)
//               .sort()
//               .map((date) => (
//                 <div key={date} className="flex-none w-80 p-4 border border-gray-100 rounded-lg bg-gray-50"> {/* Fixed width for horizontal layout */}
//                   <h4 className="text-md font-medium text-gray-800 mb-3">
//                     {format(new Date(date), 'EEEE, MMM dd, yyyy')}
//                   </h4>
//                   <div className="max-h-60 overflow-y-auto pr-2"> {/* Inner vertical scroll for cards */}
//                     {careRequestMatches.suggestions[date].length > 0 ? (
//                       careRequestMatches.suggestions[date].map((suggestion: any) =>
//                         renderProviderCard(suggestion.provider, suggestion.reasons, suggestion.warnings, date)
//                       )
//                     ) : (
//                       <p className="text-sm text-gray-500">No providers available for this day.</p>
//                     )}
//                   </div>
//                 </div>
//               ))}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }
import { CareRequestMatches, MatchingSuggestion } from '../../types';
import { CheckCircle, AlertTriangle, MapPin, Star } from 'lucide-react';

interface ProviderSuggestionsListProps {
  careRequestMatches: CareRequestMatches | null;
  onAssign: (providerId: string) => void;
  assignedProviderId: string | null;
}

export default function ProviderSuggestionsList({
  careRequestMatches,
  onAssign,
  assignedProviderId,
}: ProviderSuggestionsListProps) {
  if (!careRequestMatches || !careRequestMatches.suggestions) {
    return (
      <div className="text-center py-4 text-gray-500">
        No provider suggestions available for this care request.
      </div>
    );
  }

  // Handle both old (per_day) and new (consistent) formats for backward compatibility
  let suggestions: MatchingSuggestion[] = [];
  if (Array.isArray(careRequestMatches.suggestions)) {
    suggestions = careRequestMatches.suggestions;
  } else if (typeof careRequestMatches.suggestions === 'object') {
    // Handle old per_day format - flatten all date suggestions into one array
    const dateSuggestions = Object.values(careRequestMatches.suggestions) as MatchingSuggestion[][];
    suggestions = dateSuggestions.flat();
  }

  if (suggestions.length === 0) {
    return (
      <div className="text-center py-4 text-gray-500">
        No provider suggestions available for this care request.
      </div>
    );
  }

  const renderProviderCard = (suggestion: MatchingSuggestion) => {
    const { provider, score, reasons, warnings } = suggestion;
    const isAssigned = assignedProviderId === provider.id;

    return (
      <div
        key={provider.id}
        className={`border rounded-lg p-4 mb-3 shadow-sm ${
          isAssigned ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2">
          <h5 className="text-md font-semibold text-gray-900">
            {provider.name}
          </h5>
          <div className="flex items-center space-x-3 sm:ml-auto">
            {provider.rating && (
              <div className="flex items-center text-sm text-yellow-600">
                <Star className="w-4 h-4 fill-current mr-1" />
                <span>{provider.rating.toFixed(1)}</span>
              </div>
            )}
            <div className="text-xs text-gray-500">Score: {score}</div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-x-4 mb-2">
          <p className="text-sm text-gray-600">
            Specialties: {provider.specialties.join(', ') || 'N/A'}
          </p>
          <p className="text-sm text-gray-600 flex items-center">
            <MapPin className="w-4 h-4 mr-1 text-gray-500" />
            {provider.location}
          </p>
        </div>

        {reasons.length > 0 && (
          <div className="mt-2">
            <h6 className="text-xs font-medium text-green-700 mb-1">
              Reasons to Assign
            </h6>
            <ul className="list-disc list-inside text-xs text-green-600 space-y-0.5">
              {reasons.map((reason, i) => (
                <li key={i} className="flex items-center">
                  <CheckCircle className="w-3 h-3 mr-1 text-green-500 flex-shrink-0" />
                  {reason}
                </li>
              ))}
            </ul>
          </div>
        )}

        {warnings.length > 0 && (
          <div className="mt-2">
            <h6 className="text-xs font-medium text-red-700 mb-1">Warnings</h6>
            <ul className="list-disc list-inside text-xs text-red-600 space-y-0.5">
              {warnings.map((warning, i) => (
                <li key={i} className="flex items-center">
                  <AlertTriangle className="w-3 h-3 mr-1 text-red-500 flex-shrink-0" />
                  {warning}
                </li>
              ))}
            </ul>
          </div>
        )}

        <button
          onClick={() => onAssign(provider.id)}
          className={`mt-3 w-full px-3 py-2 text-sm font-medium rounded-md transition-colors ${
            isAssigned
              ? 'bg-gray-300 text-gray-700 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
          disabled={isAssigned}
        >
          Assign Provider
        </button>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-3">
          Provider Suggestions
        </h3>
        {suggestions.map((suggestion) =>
          renderProviderCard(suggestion)
        )}
      </div>
    </div>
  );
}
