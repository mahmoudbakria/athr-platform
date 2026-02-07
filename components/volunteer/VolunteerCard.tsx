
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { VolunteerDelivery } from "@/types"
import { format } from "date-fns"
import { Calendar, Car, MapPin, Phone, Weight, MessageCircle } from "lucide-react"

interface VolunteerCardProps {
    volunteer: VolunteerDelivery
}

export function VolunteerCard({ volunteer }: VolunteerCardProps) {
    const initials = volunteer.profiles?.full_name
        ?.split(' ')
        .map((n: string) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase() || 'VN'

    const getWhatsAppLink = (phone?: string | null) => {
        if (!phone) return '#'

        let cleanPhone = phone.replace(/\D/g, '')

        if (cleanPhone.startsWith('972')) {
            // Already maintains country code
        } else if (cleanPhone.startsWith('0')) {
            cleanPhone = '972' + cleanPhone.substring(1)
        } else {
            cleanPhone = '972' + cleanPhone
        }

        const message = encodeURIComponent('هل يمكنك مساعدتي في التوصيل')
        return `https://wa.me/+${cleanPhone}?text=${message}`
    }

    const deliveryDate = new Date(volunteer.delivery_date)
    const isValidDate = !isNaN(deliveryDate.getTime())
    const isExpired = isValidDate
        ? new Date().setHours(0, 0, 0, 0) > deliveryDate.setHours(0, 0, 0, 0)
        : false

    return (
        <Card className={`overflow-hidden transition-all ${isExpired ? 'opacity-75 grayscale-[0.5]' : 'hover:shadow-md'}`}>
            <CardContent className="p-0">
                <div className={`p-4 flex items-center gap-3 border-b ${isExpired ? 'bg-slate-100' : 'bg-slate-50/50'}`}>
                    <Avatar className="h-10 w-10 border">
                        <AvatarImage src={volunteer.profiles?.avatar_url || ''} />
                        <AvatarFallback className="bg-primary/10 text-primary font-medium">
                            {initials}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-sm truncate">
                                {volunteer.profiles?.full_name || 'Volunteer Helper'}
                            </h3>
                            {isExpired && (
                                <Badge variant="secondary" className="px-1.5 py-0 text-[10px] bg-slate-200 text-slate-600">
                                    Expired
                                </Badge>
                            )}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                            <Car className="h-3 w-3" />
                            <span>{volunteer.car_type}</span>
                        </div>
                    </div>
                </div>

                <div className="p-4 space-y-3">
                    {/* Route */}
                    <div className="flex items-start gap-2">
                        <div className="flex flex-col items-center gap-1 mt-1">
                            <div className={`h-2 w-2 rounded-full ${isExpired ? 'bg-slate-400' : 'bg-blue-500'}`} />
                            <div className="w-0.5 h-6 bg-slate-200" />
                            <div className={`h-2 w-2 rounded-full ${isExpired ? 'bg-slate-400' : 'bg-green-500'}`} />
                        </div>
                        <div className="flex-1 space-y-4">
                            <div>
                                <p className="text-xs text-muted-foreground mb-0.5">من</p>
                                <p className="text-sm font-medium leading-normal">{volunteer.from_city}</p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground mb-0.5">إلى</p>
                                <p className="text-sm font-medium leading-normal">{volunteer.to_city}</p>
                            </div>
                        </div>
                    </div>

                    {/* Details */}
                    <div className="grid grid-cols-2 gap-2 pt-2">
                        <div className={`p-2 rounded-md ${isExpired ? 'bg-slate-100' : 'bg-slate-50'}`}>
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                                <Calendar className="h-3.5 w-3.5" />
                                <span>Date</span>
                            </div>
                            <p className={`text-sm font-medium ${isExpired ? 'text-muted-foreground line-through' : ''}`}>
                                {isValidDate ? format(deliveryDate, 'MMM d') : 'N/A'}
                            </p>
                            {volunteer.delivery_time && (
                                <p className="text-xs text-muted-foreground">{volunteer.delivery_time}</p>
                            )}
                        </div>
                        <div className={`p-2 rounded-md ${isExpired ? 'bg-slate-100' : 'bg-slate-50'}`}>
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                                <Weight className="h-3.5 w-3.5" />
                                <span>Max Load</span>
                            </div>
                            <p className="text-sm font-medium">{volunteer.max_weight_kg} kg</p>
                        </div>
                    </div>

                    {volunteer.notes && (
                        <div className="text-xs text-muted-foreground bg-yellow-50/50 p-2 rounded border border-yellow-100">
                            "{volunteer.notes}"
                        </div>
                    )}
                </div>
            </CardContent>
            <CardFooter className="p-4 pt-0 grid grid-cols-2 gap-2">
                <Button className="w-full gap-2" variant="outline" disabled={isExpired} asChild={!isExpired}>
                    {isExpired ? (
                        <span>Locked</span>
                    ) : (
                        <a href={`tel:${volunteer.contact_phone}`}>
                            <Phone className="h-4 w-4" />
                            Call
                        </a>
                    )}
                </Button>
                <Button
                    className={`w-full gap-2 ${isExpired ? 'bg-slate-300 text-slate-500 hover:bg-slate-300' : 'bg-green-600 hover:bg-green-700 text-white'}`}
                    disabled={isExpired}
                    asChild={!isExpired}
                >
                    {isExpired ? (
                        <span>Locked</span>
                    ) : (
                        <a
                            href={getWhatsAppLink(volunteer.contact_phone)}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <MessageCircle className="h-4 w-4" />
                            WhatsApp
                        </a>
                    )}
                </Button>
            </CardFooter>
        </Card>
    )
}
