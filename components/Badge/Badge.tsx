export function Badge({value}: { value: string }) {
  return <span className={`badge ${value.toLowerCase()}`}>
    {value.replaceAll('_', ' ')}
  </span>
}