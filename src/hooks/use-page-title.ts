import { usePathname } from "next/navigation"


const pageTitles : {
    [key: string]: string
} = {
    "/dashboard/tasks": "Tasks",
    "/dashboard/workers": "Workers",
    "/dashboard/logs": "Logs",
}

export default function usePageTitle() {
    const pathname = usePathname();
    return pageTitles[pathname] || "Default Title";
}