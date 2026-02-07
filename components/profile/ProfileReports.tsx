import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Trophy, Upload, HeartHandshake, Info } from "lucide-react"

interface ProfileReportsProps {
    stats: {
        totalDonated: number
        totalUploaded: number
        totalPoints: number
        volunteerPoints?: number
    }
    gamification: {
        enabled: boolean
        volunteerEnabled: boolean
        pointsPerUpload: number
        pointsPerDonation: number
        pointsPerVolunteer: number
    }
}

export function ProfileReports({ stats, gamification }: ProfileReportsProps) {
    return (
        <div className="space-y-6" dir="rtl">
            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            نقاط التبرع
                        </CardTitle>
                        <Trophy className="h-4 w-4 text-emerald-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalPoints}</div>
                        <p className="text-xs text-muted-foreground">
                            مكتسبة من التبرعات
                        </p>
                    </CardContent>
                </Card>
                {gamification.volunteerEnabled && (
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                نقاط التطوع
                            </CardTitle>
                            <Trophy className="h-4 w-4 text-amber-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.volunteerPoints || 0}</div>
                            <p className="text-xs text-muted-foreground">
                                مكتسبة من التوصيل
                            </p>
                        </CardContent>
                    </Card>
                )}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            تبرعات ناجحة
                        </CardTitle>
                        <HeartHandshake className="h-4 w-4 text-rose-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalDonated}</div>
                        <p className="text-xs text-muted-foreground">
                            أغراض تم التبرع بها
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            أغراض معروضة
                        </CardTitle>
                        <Upload className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalUploaded}</div>
                        <p className="text-xs text-muted-foreground">
                            إجمالي الأغراض المضافة
                        </p>
                    </CardContent>
                </Card>
            </div>



            {/* Gamification Info - Only show if enabled */}
            <Card className="bg-muted/30 border-border/50">
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Info className="h-5 w-5 text-primary" />
                        <CardTitle className="text-lg">نظام النقاط</CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                        اجمع النقاط من خلال المساهمة في المجتمع. إليك كيفية عمل النظام:
                    </p>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        <div className="flex items-center justify-between p-3 bg-background rounded-lg border">
                            <span className="text-sm font-medium">إضافة غرض جديد</span>
                            <div className="flex items-center gap-1.5 text-blue-600 font-bold bg-blue-50 px-2 py-1 rounded">
                                <Trophy className="h-3.5 w-3.5" />
                                +{gamification.pointsPerUpload} نقطة
                            </div>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-background rounded-lg border">
                            <span className="text-sm font-medium">إتمام تبرع</span>
                            <div className="flex items-center gap-1.5 text-rose-600 font-bold bg-rose-50 px-2 py-1 rounded">
                                <Trophy className="h-3.5 w-3.5" />
                                +{gamification.pointsPerDonation} نقطة
                            </div>
                        </div>
                        {gamification.volunteerEnabled && (
                            <div className="flex items-center justify-between p-3 bg-background rounded-lg border">
                                <span className="text-sm font-medium">توصيل تطوعي</span>
                                <div className="flex items-center gap-1.5 text-amber-600 font-bold bg-amber-50 px-2 py-1 rounded">
                                    <Trophy className="h-3.5 w-3.5" />
                                    +{gamification.pointsPerVolunteer} نقطة
                                </div>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div >
    )
}
