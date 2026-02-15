<?php

namespace App\Http\Controllers;

use App\Models\TrainingSession;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

class TrainingSessionController extends Controller
{
    use AuthorizesRequests;

    public function index(Request $request)
    {
        $user = Auth::user();
        $query = TrainingSession::with(['formation', 'trainer', 'client']);

        if ($user->role === 'TRAINER' && $user->formateur) {
            $query->where('trainer_id', $user->formateur->id);
        } elseif ($user->role === 'CLIENT' && $user->client) {
            $query->where('client_id', $user->client->id);
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $sessions = $query->orderBy('date', 'desc')->paginate(10);

        return view('sessions.index', compact('sessions'));
    }

    public function show(TrainingSession $session)
    {
        $this->authorize('view', $session);
        return view('sessions.show', compact('session'));
    }

    public function generateICS(TrainingSession $session)
    {
        $this->authorize('view', $session);

        $date = $session->date;
        $start = $date->format('Ymd\THis\Z');
        $end = $date->copy()->addHours(4)->format('Ymd\THis\Z'); // Default duration assumption

        $ics = "BEGIN:VCALENDAR\r\n";
        $ics .= "VERSION:2.0\r\n";
        $ics .= "PRODID:-//Laravel App//EN\r\n";
        $ics .= "BEGIN:VEVENT\r\n";
        $ics .= "UID:" . $session->id . "@example.com\r\n";
        $ics .= "DTSTAMP:" . now()->format('Ymd\THis\Z') . "\r\n";
        $ics .= "DTSTART:{$start}\r\n";
        $ics .= "DTEND:{$end}\r\n";
        $ics .= "SUMMARY:Formation: " . ($session->formation ? $session->formation->title : 'Unknown Formation') . "\r\n";
        $ics .= "DESCRIPTION:Details available in dashboard.\r\n";
        $ics .= "LOCATION:" . ($session->location ?? 'To be defined') . "\r\n";
        $ics .= "END:VEVENT\r\n";
        $ics .= "END:VCALENDAR\r\n";

        return response($ics)
            ->header('Content-Type', 'text/calendar; charset=utf-8')
            ->header('Content-Disposition', 'attachment; filename="session-' . $session->id . '.ics"');
    }

    public function print(TrainingSession $session)
    {
        $this->authorize('view', $session);
        return view('sessions.print', compact('session'));
    }
}
