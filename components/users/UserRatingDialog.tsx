import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { StarRating } from '@/components/ui/star-rating'
import { rateUser, getMyRatingForUser, getUserRatings, UserRating } from '@/lib/actions/rating'
import { Loader2, User } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { toast } from 'sonner'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'

interface UserRatingDialogProps {
    userId: string
    userName: string
    userAvatar?: string | null
    currentRatingStats: { average: number; count: number }
    children: React.ReactNode
    currentUserId?: string
}

export function UserRatingDialog({
    userId,
    userName,
    userAvatar,
    currentRatingStats,
    children,
    currentUserId
}: UserRatingDialogProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [rating, setRating] = useState(0)
    const [comment, setComment] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [existingRating, setExistingRating] = useState<{ rating: number; comment: string | null } | null>(null)
    const [recentRatings, setRecentRatings] = useState<UserRating[]>([])
    const [loadingConfig, setLoadingConfig] = useState(true)

    const isSelf = currentUserId === userId

    useEffect(() => {
        if (isOpen) {
            const loadData = async () => {
                setLoadingConfig(true)
                try {
                    const [myRating, ratings] = await Promise.all([
                        !isSelf && currentUserId ? getMyRatingForUser(userId) : null,
                        getUserRatings(userId)
                    ])

                    if (myRating) {
                        setExistingRating(myRating)
                        setRating(myRating.rating)
                        setComment(myRating.comment || '')
                    }
                    setRecentRatings(ratings)
                } finally {
                    setLoadingConfig(false)
                }
            }
            loadData()
        }
    }, [isOpen, userId, isSelf, currentUserId])

    const handleSubmit = async () => {
        if (rating === 0) {
            toast.error("Error", {
                description: "Please select a rating",
            })
            return
        }

        setIsSubmitting(true)
        try {
            const result = await rateUser(userId, rating, comment)
            if (result.error) {
                toast.error("Error", {
                    description: result.error,
                })
            } else {
                toast.success("Success", {
                    description: "Rating submitted successfully",
                })
                setIsOpen(false)
            }
        } catch (error) {
            toast.error("Error", {
                description: "Something went wrong",
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-center flex flex-col items-center gap-2">
                        <Avatar className="h-16 w-16">
                            <AvatarImage src={userAvatar || undefined} />
                            <AvatarFallback><User className="h-8 w-8 text-muted-foreground" /></AvatarFallback>
                        </Avatar>
                        <div>
                            <div className="text-lg">{userName}</div>
                            <div className="flex items-center gap-2 justify-center text-sm font-normal text-muted-foreground">
                                <StarRating value={currentRatingStats.average} readOnly size={14} />
                                <span>({currentRatingStats.count} reviews)</span>
                            </div>
                        </div>
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {!isSelf && currentUserId ? (
                        <div className="space-y-4 bg-muted/30 p-4 rounded-lg">
                            <h3 className="text-sm font-medium">{existingRating ? 'Edit your review' : 'Rate this user'}</h3>
                            <div className="flex flex-col items-center gap-2">
                                <StarRating value={rating} onChange={setRating} size={32} />
                                <span className="text-xs text-muted-foreground">
                                    {rating === 1 && "Poor"}
                                    {rating === 2 && "Fair"}
                                    {rating === 3 && "Good"}
                                    {rating === 4 && "Very Good"}
                                    {rating === 5 && "Excellent"}
                                </span>
                            </div>
                            <Textarea
                                placeholder="Share your experience (optional)..."
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                className="resize-none"
                            />
                            <Button onClick={handleSubmit} disabled={isSubmitting} className="w-full">
                                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {existingRating ? 'Update Review' : 'Submit Review'}
                            </Button>
                        </div>
                    ) : isSelf ? (
                        <p className="text-center text-sm text-muted-foreground p-4">You cannot rate yourself.</p>
                    ) : (
                        <p className="text-center text-sm text-muted-foreground p-4">Please login to rate this user.</p>
                    )}

                    {recentRatings.length > 0 && (
                        <div className="space-y-3">
                            <h3 className="text-sm font-medium px-1">Recent Reviews</h3>
                            <ScrollArea className="h-[200px] pr-4">
                                <div className="space-y-4">
                                    {recentRatings.map((review) => (
                                        <div key={review.id} className="flex gap-3 text-sm">
                                            <Avatar className="h-8 w-8 border">
                                                <AvatarImage src={review.rater?.avatar_url || undefined} />
                                                <AvatarFallback><User className="h-4 w-4" /></AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1 space-y-1">
                                                <div className="flex items-center justify-between">
                                                    <span className="font-medium text-xs">{review.rater?.full_name || 'Anonymous'}</span>
                                                    <span className="text-xs text-muted-foreground">{new Date(review.created_at).toLocaleDateString()}</span>
                                                </div>
                                                <StarRating value={review.rating} readOnly size={12} />
                                                {review.comment && (
                                                    <p className="text-muted-foreground text-xs mt-1">{review.comment}</p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </ScrollArea>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}
