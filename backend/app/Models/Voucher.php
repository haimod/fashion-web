<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Voucher extends Model
{
    protected $table = 'VOUCHER';
    protected $primaryKey = 'ma_voucher';
    protected $keyType = 'string';
    public $incrementing = false;

    // TODO: Add fillable & relationships
}
