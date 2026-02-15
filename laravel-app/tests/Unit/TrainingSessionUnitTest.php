<?php

namespace Tests\Unit;

use App\Models\TrainingSession;
use PHPUnit\Framework\TestCase;

class TrainingSessionUnitTest extends TestCase
{
    public function test_logistics_strictly_complete_returns_false_if_empty(): void
    {
        $session = new TrainingSession();
        $session->logistics = [];
        $this->assertFalse($session->isLogisticsStrictlyComplete());
    }

    public function test_logistics_strictly_complete_returns_false_if_partial(): void
    {
        $session = new TrainingSession();
        $session->logistics = ['access' => 'ok'];
        $this->assertFalse($session->isLogisticsStrictlyComplete());
    }

    public function test_logistics_strictly_complete_returns_true_if_complete(): void
    {
        $session = new TrainingSession();
        $session->logistics = ['access' => 'ok', 'wifi' => 'ok', 'videoMaterial' => 'ok'];
        $this->assertTrue($session->isLogisticsStrictlyComplete());
    }
}
