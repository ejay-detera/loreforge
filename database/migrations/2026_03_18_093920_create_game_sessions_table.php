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
        Schema::create('game_sessions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->enum('genre', ['fantasy', 'horror', 'scifi']);
            $table->string('character_name');
            $table->integer('current_health')->default(100);
            $table->integer('max_health')->default(100);
            $table->integer('current_mana')->default(50);
            $table->integer('max_mana')->default(50);
            $table->integer('turn_count')->default(0);
            $table->integer('max_turns')->default(20);
            $table->enum('status', ['active', 'completed', 'abandoned'])->default('active');
            $table->enum('outcome', ['victory', 'defeat', 'abandoned'])->nullable();
            $table->boolean('is_public')->default(false);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('game_sessions');
    }
};
