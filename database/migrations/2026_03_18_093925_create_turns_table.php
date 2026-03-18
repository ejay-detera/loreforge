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
        Schema::create('turns', function (Blueprint $table) {
            $table->id();
            $table->foreignId('session_id')->constrained('game_sessions')->onDelete('cascade');
            $table->integer('batch_id');
            $table->integer('turn_number');
            $table->text('story_text');
            $table->json('choices');
            $table->json('outcomes');
            $table->string('player_choice')->nullable();
            $table->integer('health_change')->nullable();
            $table->integer('mana_change')->nullable();
            $table->integer('enemy_hp_change')->nullable();
            $table->boolean('is_resolved')->default(false);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('turns');
    }
};
