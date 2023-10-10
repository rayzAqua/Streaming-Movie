export const Select = ({label,options,onChange})=>{
    return(
        <>
        <label className="text-border font-semibold">{label}</label>
        <select className="w-full mt-2 px-6 py-4 text-text bg-main border border-border rounded" onChange={onChange}>
            {options.map((o,i)=>(
            <option key={i} value={o.value}>
                {o.title}
            </option>
            ))}
        </select>
        </>
    )
}