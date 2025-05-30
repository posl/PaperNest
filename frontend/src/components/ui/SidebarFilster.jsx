const fields = ["title", "author", "year", "conference", "rank", "pdf"];

export default function SidebarFilter({ tempSelectedFields, setTempSelectedFields, onApply }) {
  const toggleField = (field) => {
    setTempSelectedFields(prev =>
      prev.includes(field) ? prev.filter(f => f !== field) : [...prev, field]
    );
  };

  return (
    <div className="p-4 w-48">
      {fields.map(field => (
        <div key={field} className="mb-2">
          <input
            type="checkbox"
            checked={tempSelectedFields.includes(field)}
            onChange={() => toggleField(field)}
          />
          <label className="ml-2">{field}</label>
        </div>
      ))}
      <button
        onClick={onApply}
        className="mt-4 px-2 py-1 border rounded hover:bg-gray-100"
      >
        反映させる
      </button>
    </div>
  );
}
