<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    protected $table = 'DONHANG';
    protected $primaryKey = 'ma_dh';
    protected $keyType = 'string';
    public $incrementing = false;

    // TODO: Add fillable & relationships
}
