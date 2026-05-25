import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"
import {
    ChevronsUpDown,
    CreditCard,
    Home,
    LogOut,
    UserRound,
    Wrench,
} from "lucide-react"
import { Link, useLocation, useNavigate } from "react-router-dom"

const items = [
    {
        title: "Home",
        url: "/",
        icon: Home,
        isActive: (pathname: string) => pathname === "/",
    },
    {
        title: "Repair Orders",
        url: "/repair-orders",
        icon: Wrench,
        isActive: (pathname: string) => pathname.startsWith("/repair-orders"),
    },
    {
        title: "Installments",
        url: "/installments",
        icon: CreditCard,
        isActive: (pathname: string) => pathname.startsWith("/installments"),
    },
]

export function AppSidebar() {
    const { pathname } = useLocation()

    return (
        <Sidebar>
            <SidebarHeader className="border-b border-sidebar-border px-3 py-4">
                <Link
                    to="/"
                    className="group flex items-center gap-3 rounded-lg px-2 py-2 outline-none transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 focus-visible:ring-sidebar-ring"
                    aria-label="Go to Home"
                >
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary text-sm font-bold text-sidebar-primary-foreground shadow-sm">
                        W
                    </span>
                    <div className="min-w-0 group-data-[collapsible=icon]:hidden">
                        <h1 className="truncate text-xl font-bold leading-tight tracking-tight">
                            Workshop
                        </h1>
                        <p className="truncate text-xs font-medium text-sidebar-foreground/60">
                            Tracking workspace
                        </p>
                    </div>
                </Link>
            </SidebarHeader>

            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {items.map((item) => {
                                const active = item.isActive(pathname)

                                return (
                                    <SidebarMenuItem key={item.title}>
                                        <SidebarMenuButton
                                            asChild
                                            isActive={active}
                                            tooltip={item.title}
                                            className={cn(
                                                "h-10 rounded-lg font-medium",
                                                active &&
                                                    "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm ring-1 ring-sidebar-border"
                                            )}
                                        >
                                            <Link to={item.url}>
                                                <item.icon />
                                                <span>{item.title}</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                )
                            })}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

            <SidebarFooter className="border-t border-sidebar-border p-3">
                <SidebarUserMenu />
            </SidebarFooter>
        </Sidebar>
    )
}

function SidebarUserMenu() {
    const navigate = useNavigate()
    const user = {
        name: "Username",
        email: "username@example.com",
    }

    const handleLogout = () => {
        console.log("Logout clicked")
        navigate("/")
    }

    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <SidebarMenuButton
                            size="lg"
                            className="h-12 rounded-lg data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                        >
                            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-sidebar-primary text-xs font-bold text-sidebar-primary-foreground">
                                U
                            </span>
                            <span className="grid min-w-0 flex-1 text-left text-sm leading-tight">
                                <span className="truncate font-semibold">{user.name}</span>
                                <span className="truncate text-xs text-sidebar-foreground/60">
                                    {user.email}
                                </span>
                            </span>
                            <ChevronsUpDown className="ml-auto size-4 text-sidebar-foreground/50" />
                        </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        side="right"
                        align="end"
                        className="w-56"
                    >
                        <DropdownMenuLabel className="font-normal">
                            <div className="flex items-center gap-2">
                                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-bold text-muted-foreground">
                                    U
                                </span>
                                <div className="min-w-0">
                                    <p className="truncate text-sm font-semibold text-foreground">
                                        {user.name}
                                    </p>
                                    <p className="truncate text-xs text-muted-foreground">
                                        {user.email}
                                    </p>
                                </div>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                            <UserRound className="size-4" />
                            Account
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={handleLogout}>
                            <LogOut className="size-4" />
                            Logout
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarMenuItem>
        </SidebarMenu>
    )
}
