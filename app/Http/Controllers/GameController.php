<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Auth;
use App\Models\GameSession;
use Inertia\Inertia;

class GameController extends Controller
{
    public function show()
    {
        $session = GameSession::where('user_id', Auth::id())
            ->where('status', 'active')
            ->with(['inventoryItems' => function ($q) {
                $q->whereNull('removed_at');
            }])
            ->latest()
            ->first();

        return Inertia::render('Game', [
            'initialSession' => $session,
        ]);
    }
}
