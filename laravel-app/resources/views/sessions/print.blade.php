<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Training Session - {{ $session->formation ? $session->formation->title : 'Session' }}</title>
    <style>
        body { font-family: sans-serif; }
        .header { margin-bottom: 20px; border-bottom: 2px solid #000; padding-bottom: 10px; }
        .section { margin-bottom: 20px; }
        h1 { font-size: 24px; }
        h2 { font-size: 18px; border-bottom: 1px solid #ccc; }
        table { width: 100%; border-collapse: collapse; }
        th, td { border: 1px solid #000; padding: 8px; text-align: left; }
        @media print {
            .no-print { display: none; }
        }
    </style>
</head>
<body>
    <button class="no-print" onclick="window.print()">Print this page</button>

    <div class="header">
        <h1>Attendance Sheet / Feuille de Présence</h1>
        <p><strong>Formation:</strong> {{ $session->formation ? $session->formation->title : 'Unknown' }}</p>
        <p><strong>Date:</strong> {{ $session->date->format('d/m/Y') }}</p>
        <p><strong>Trainer:</strong> {{ $session->trainer ? $session->trainer->first_name . ' ' . $session->trainer->last_name : 'TBD' }}</p>
        <p><strong>Client:</strong> {{ $session->client ? $session->client->company_name : 'TBD' }}</p>
    </div>

    <div class="section">
        <h2>Participants</h2>
        <table>
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Signature (Morning)</th>
                    <th>Signature (Afternoon)</th>
                </tr>
            </thead>
            <tbody>
                @if($session->participants)
                    @foreach($session->participants as $participant)
                        <tr>
                            <td>{{ $participant['name'] ?? 'N/A' }}</td>
                            <td>{{ $participant['email'] ?? 'N/A' }}</td>
                            <td></td>
                            <td></td>
                        </tr>
                    @endforeach
                @else
                    <tr>
                        <td colspan="4">No participants registered yet.</td>
                    </tr>
                @endif
                <!-- Empty rows for extra attendees -->
                @for($i = 0; $i < 5; $i++)
                    <tr>
                        <td>&nbsp;</td>
                        <td>&nbsp;</td>
                        <td>&nbsp;</td>
                        <td>&nbsp;</td>
                    </tr>
                @endfor
            </tbody>
        </table>
    </div>

    <div class="section">
        <h2>Trainer Signature</h2>
        <div style="height: 50px; border: 1px solid #000; margin-top: 10px;"></div>
    </div>
</body>
</html>
