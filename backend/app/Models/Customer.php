<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Customer extends Model
{
    protected $table = 'KHACHHANG';
    protected $primaryKey = 'ma_kh';
    protected $keyType = 'string';
    public $incrementing = false;

    // TODO: Add fillable & relationships
}
