<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Collection extends Model
{
    protected $table = 'BOSUUTAP';
    protected $primaryKey = 'ma_bst';
    protected $keyType = 'string';
    public $incrementing = false;

    // TODO: Add fillable & relationships
}
