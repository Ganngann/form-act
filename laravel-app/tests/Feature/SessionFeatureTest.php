<?php

namespace Tests\Feature;

use App\Models\TrainingSession;
use App\Models\User;
use App\Models\Formation;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;

class SessionFeatureTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_view_sessions(): void
    {
        $user = User::factory()->create(['role' => 'ADMIN']);
        $formation = Formation::factory()->create(['title' => 'Unique Formation Title']);
        $session = TrainingSession::factory()->create(['formation_id' => $formation->id]);

        $response = $this->actingAs($user)->get('/sessions');

        $response->assertStatus(200);
        $response->assertSee('Unique Formation Title');
    }

    public function test_can_download_ics(): void
    {
        $user = User::factory()->create(['role' => 'ADMIN']);
        $formation = Formation::factory()->create(['title' => 'ICS Test Formation']);
        $session = TrainingSession::factory()->create(['formation_id' => $formation->id]);

        $response = $this->actingAs($user)->get("/sessions/{$session->id}/ics");

        $response->assertStatus(200);
        $response->assertHeader('Content-Type', 'text/calendar; charset=utf-8');
        $response->assertSee('BEGIN:VCALENDAR');
        $response->assertSee('SUMMARY:Formation: ICS Test Formation');
    }
}
