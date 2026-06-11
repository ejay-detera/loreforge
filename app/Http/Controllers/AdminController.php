<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use App\Models\GameSession;
use App\Models\SharedCampaign;
use Inertia\Inertia;

class AdminController extends Controller
{
    public function index()
    {
        $usersCount = User::count();
        $sessionsCount = GameSession::count();
        $sharedCount = SharedCampaign::count();

        $recentUsers = User::orderBy('created_at', 'desc')->take(5)->get(['id', 'username', 'email', 'created_at', 'is_admin']);

        return Inertia::render('Admin', [
            'stats' => [
                'users' => $usersCount,
                'sessions' => $sessionsCount,
                'shared' => $sharedCount,
            ],
            'recentUsers' => $recentUsers,
        ]);
    }
}
