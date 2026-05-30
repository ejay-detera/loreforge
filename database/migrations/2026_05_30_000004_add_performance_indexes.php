<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('shared_campaigns', function (Blueprint $table) {
            $table->index('shared_at');
        });

        Schema::table('game_sessions', function (Blueprint $table) {
            $table->index('genre');
            $table->index('status');
        });

        Schema::table('turns', function (Blueprint $table) {
            $table->index(['session_id', 'turn_number']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('shared_campaigns', function (Blueprint $table) {
            $table->dropIndex(['shared_at']);
        });

        Schema::table('game_sessions', function (Blueprint $table) {
            $table->dropIndex(['genre']);
            $table->dropIndex(['status']);
        });

        Schema::table('turns', function (Blueprint $table) {
            $table->dropIndex(['session_id', 'turn_number']);
        });
    }
};
