<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Review extends Model
{
    protected $table = 'DANHGIA_SP';
    protected $primaryKey = 'ma_danh_gia';
    protected $keyType = 'string';
    public $incrementing = false;

    // TODO: Add fillable & relationships
}
