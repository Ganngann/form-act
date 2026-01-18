import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function CheckoutSuccessPage() {
    return (
        <div className="container mx-auto py-20 text-center space-y-6">
            <h1 className="text-4xl font-bold text-green-600">Réservation confirmée !</h1>
            <p className="text-xl">Votre compte a été créé et votre session est enregistrée.</p>
            <div className="flex justify-center gap-4">
                <Button asChild>
                    <Link href="/">Retour à l&apos;accueil</Link>
                </Button>
            </div>
        </div>
    )
}
