export default function Tabs({ tabs, active, onChange }) {
  return (
    <div className="tabs" role="tablist">
      {tabs.map((tab) => (
        <button key={tab.id} type="button" role="tab" aria-selected={active === tab.id} className={`tab${active === tab.id ? ' active' : ''}`} onClick={() => onChange(tab.id)}>
          {tab.label}
          {tab.count > 0 && <span className="tab-count">{tab.count}</span>}
        </button>
      ))}
    </div>
  );
}
